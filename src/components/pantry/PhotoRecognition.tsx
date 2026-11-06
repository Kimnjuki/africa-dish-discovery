import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Loader2, ImagePlus, Sparkles, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IdentifiedIngredient {
  name: string;
  quantity: number;
  unit: string;
  confidence: number;
}

interface PhotoRecognitionProps {
  onAddIngredients: (ingredients: { name: string; quantity: number; unit: string }[]) => Promise<void>;
}

const PhotoRecognition = ({ onAddIngredients }: PhotoRecognitionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<IdentifiedIngredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [summary, setSummary] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      toast.error("Camera access denied. Try uploading an image instead.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
      processImage(imageData);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);
      processImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageBase64: string) => {
    setIsProcessing(true);
    setIdentifiedIngredients([]);
    setSummary("");

    try {
      const { data, error } = await supabase.functions.invoke('identify-ingredients', {
        body: { imageBase64 }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const ingredients = data.ingredients || [];
      setIdentifiedIngredients(ingredients);
      setSummary(data.summary || "");
      
      // Auto-select all ingredients with confidence > 0.7
      const autoSelected = new Set<number>();
      ingredients.forEach((ing: IdentifiedIngredient, idx: number) => {
        if (ing.confidence >= 0.7) {
          autoSelected.add(idx);
        }
      });
      setSelectedIngredients(autoSelected);

      if (ingredients.length === 0) {
        toast.info("No ingredients detected. Try a clearer image.");
      } else {
        toast.success(`Found ${ingredients.length} ingredient(s)`);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error("Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleIngredient = (index: number) => {
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIngredients(newSelected);
  };

  const addSelectedIngredients = async () => {
    const toAdd = identifiedIngredients
      .filter((_, idx) => selectedIngredients.has(idx))
      .map(ing => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit
      }));

    if (toAdd.length === 0) {
      toast.info("Select ingredients to add");
      return;
    }

    await onAddIngredients(toAdd);
    toast.success(`Added ${toAdd.length} ingredient(s) to pantry`);
    resetState();
    setIsOpen(false);
  };

  const resetState = () => {
    setCapturedImage(null);
    setIdentifiedIngredients([]);
    setSelectedIngredients(new Set());
    setSummary("");
    stopCamera();
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    setIsOpen(open);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-500";
    if (confidence >= 0.7) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Camera className="w-4 h-4 mr-2" />
        Photo
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Photo Recognition
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Camera / Image Display */}
            {!capturedImage && !isCapturing && (
              <div className="flex flex-col gap-3">
                <Button onClick={startCamera} className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {isCapturing && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg"
                />
                <div className="flex gap-2 mt-3">
                  <Button onClick={capturePhoto} className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Capture
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full rounded-lg max-h-48 object-cover"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Identifying ingredients...</p>
                      </div>
                    </div>
                  )}
                </div>

                {!isProcessing && identifiedIngredients.length > 0 && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">
                        Found {identifiedIngredients.length} Ingredient(s)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      {summary && (
                        <p className="text-sm text-muted-foreground mb-3">{summary}</p>
                      )}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {identifiedIngredients.map((ing, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => toggleIngredient(idx)}
                          >
                            <Checkbox
                              checked={selectedIngredients.has(idx)}
                              onCheckedChange={() => toggleIngredient(idx)}
                            />
                            <div className="flex-1">
                              <span className="font-medium capitalize">{ing.name}</span>
                              <span className="text-muted-foreground ml-2">
                                {ing.quantity} {ing.unit}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`${getConfidenceColor(ing.confidence)} text-white text-xs`}
                            >
                              {Math.round(ing.confidence * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!isProcessing && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={resetState}
                      className="flex-1"
                    >
                      Retake
                    </Button>
                    {identifiedIngredients.length > 0 && (
                      <Button
                        onClick={addSelectedIngredients}
                        disabled={selectedIngredients.size === 0}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Add ({selectedIngredients.size})
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoRecognition;
