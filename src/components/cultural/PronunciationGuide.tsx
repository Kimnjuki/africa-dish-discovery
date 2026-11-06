import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Volume2, 
  VolumeX, 
  Globe, 
  Languages 
} from "lucide-react";

interface PronunciationGuideProps {
  dishName: string;
  phonetic?: string;
  audioUrl?: string;
  language?: string;
  regionAccent?: string;
}

export function PronunciationGuide({ 
  dishName, 
  phonetic, 
  audioUrl, 
  language = "en",
  regionAccent 
}: PronunciationGuideProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold">{dishName}</span>
          {phonetic && (
            <span className="text-muted-foreground text-sm italic">
              /{phonetic}/
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          {language && (
            <Badge variant="outline" className="text-xs">
              <Languages className="h-3 w-3 mr-1" />
              {language}
            </Badge>
          )}
          {regionAccent && (
            <Badge variant="secondary" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              {regionAccent}
            </Badge>
          )}
        </div>
      </div>
      
      {audioUrl && (
        <>
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onEnded={handleEnded}
            preload="none"
          />
          <Button 
            size="icon" 
            variant={isPlaying ? "default" : "outline"}
            onClick={handlePlay}
            className="shrink-0"
          >
            {isPlaying ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </>
      )}
      
      {!audioUrl && (
        <Button size="icon" variant="ghost" disabled className="shrink-0">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
