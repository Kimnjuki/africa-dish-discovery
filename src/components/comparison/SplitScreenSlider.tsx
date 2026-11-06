import { useState, useRef } from "react";
import { GripVertical } from "lucide-react";

interface SplitScreenSliderProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  leftLabel: string;
  rightLabel: string;
}

export const SplitScreenSlider = ({ 
  leftContent, 
  rightContent, 
  leftLabel, 
  rightLabel 
}: SplitScreenSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 10), 90);
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 10), 90);
    setSliderPosition(percentage);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[400px] rounded-xl overflow-hidden border border-border select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* Left Side */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 p-4">
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium z-10">
            {leftLabel}
          </div>
          <div className="pt-10 h-full overflow-auto">
            {leftContent}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <div className="w-full h-full bg-gradient-to-br from-orange-500/10 to-orange-500/5 p-4">
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-orange-500 text-white text-sm font-medium z-10">
            {rightLabel}
          </div>
          <div className="pt-10 h-full overflow-auto">
            {rightContent}
          </div>
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize z-20 transition-transform hover:scale-x-150"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-primary">
          <GripVertical className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Slider Instructions */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs text-muted-foreground">
        Drag to compare
      </div>
    </div>
  );
};
