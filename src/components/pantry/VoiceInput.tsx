import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, MicOff, Loader2, Volume2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
}

interface VoiceInputProps {
  onAddIngredients: (ingredients: ParsedIngredient[]) => void;
}

// Parse natural language ingredient input
const parseIngredients = (text: string): ParsedIngredient[] => {
  const ingredients: ParsedIngredient[] = [];
  
  // Normalize text
  const normalized = text.toLowerCase()
    .replace(/\band\b/g, ",")
    .replace(/\balso\b/g, ",")
    .replace(/\bplus\b/g, ",")
    .replace(/\badd\b/gi, "")
    .replace(/\bsome\b/gi, "")
    .replace(/\ba few\b/gi, "3")
    .replace(/\ba couple\b/gi, "2")
    .replace(/\ba dozen\b/gi, "12")
    .replace(/\bhalf a\b/gi, "0.5")
    .trim();

  // Split by common delimiters
  const parts = normalized.split(/[,;]/).map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    // Pattern: "X unit of ingredient" or "X ingredient" or just "ingredient"
    const patterns = [
      // "2 kg of tomatoes", "3 cups of rice"
      /^(\d+(?:\.\d+)?)\s*(kg|g|lb|oz|cups?|tbsp|tsp|liters?|ml|pieces?|bunch|cloves?|cans?|packets?|bags?|bottles?)?\s*(?:of\s+)?(.+)$/i,
      // "tomatoes 2", "rice 500g"
      /^(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|g|lb|oz|cups?|tbsp|tsp|liters?|ml|pieces?)?$/i,
    ];

    let matched = false;
    
    for (const pattern of patterns) {
      const match = part.match(pattern);
      if (match) {
        if (pattern === patterns[0]) {
          ingredients.push({
            quantity: parseFloat(match[1]) || 1,
            unit: match[2] || "piece",
            name: match[3].trim()
          });
        } else {
          ingredients.push({
            name: match[1].trim(),
            quantity: parseFloat(match[2]) || 1,
            unit: match[3] || "piece"
          });
        }
        matched = true;
        break;
      }
    }

    // If no pattern matched, assume it's just an ingredient name
    if (!matched && part.length > 1) {
      // Check for leading number
      const simpleMatch = part.match(/^(\d+)\s+(.+)$/);
      if (simpleMatch) {
        ingredients.push({
          quantity: parseInt(simpleMatch[1]),
          unit: "piece",
          name: simpleMatch[2].trim()
        });
      } else {
        ingredients.push({
          quantity: 1,
          unit: "piece",
          name: part
        });
      }
    }
  }

  return ingredients;
};

const VoiceInput = ({ onAddIngredients }: VoiceInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedIngredients, setParsedIngredients] = useState<ParsedIngredient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window).SpeechRecognition || 
                              (window).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      
      if (finalTranscript) {
        const parsed = parseIngredients(finalTranscript);
        setParsedIngredients(parsed);
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone access.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try again.");
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    setError(null);
    setTranscript("");
    setParsedIngredients([]);
    
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setError("Failed to start voice recognition");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const confirmIngredients = () => {
    if (parsedIngredients.length > 0) {
      onAddIngredients(parsedIngredients);
      toast.success(`Added ${parsedIngredients.length} ingredient(s) to pantry`);
      setIsOpen(false);
      setTranscript("");
      setParsedIngredients([]);
    }
  };

  const removeIngredient = (index: number) => {
    setParsedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title="Voice input not supported in this browser"
        className="gap-2"
      >
        <MicOff className="w-4 h-4" />
        <span className="hidden sm:inline">Voice</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Mic className="w-4 h-4" />
        <span className="hidden sm:inline">Voice Input</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Voice Input
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Microphone button */}
            <div className="flex justify-center">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isListening ? (
                  <MicOff className="w-10 h-10" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {isListening ? "Listening... Tap to stop" : "Tap to start speaking"}
            </p>

            {/* Example */}
            <Card className="p-3 bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Try saying:</p>
              <p className="text-sm italic">
                "Add 2 tomatoes, 1 onion, and 500 grams of rice"
              </p>
            </Card>

            {/* Error */}
            {error && (
              <Card className="p-4 border-destructive/50 bg-destructive/10">
                <p className="text-sm text-destructive">{error}</p>
              </Card>
            )}

            {/* Transcript */}
            {transcript && (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">You said:</p>
                <p className="font-medium">{transcript}</p>
              </Card>
            )}

            {/* Parsed ingredients */}
            {parsedIngredients.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Detected ingredients:</p>
                <div className="flex flex-wrap gap-2">
                  {parsedIngredients.map((ing, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {ing.quantity} {ing.unit} {ing.name}
                      <button
                        onClick={() => removeIngredient(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {parsedIngredients.length > 0 && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTranscript("");
                    setParsedIngredients([]);
                  }}
                >
                  Clear
                </Button>
                <Button onClick={confirmIngredients}>
                  <Check className="w-4 h-4 mr-2" />
                  Add to Pantry
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceInput;
