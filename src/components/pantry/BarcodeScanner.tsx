import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Camera, X, Loader2, ScanLine, Package } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { toast } from "sonner";
import { readErrorMessage } from "@/lib/errors";

interface BarcodeScannerProps {
  onScan: (productName: string, barcode: string) => void;
}

// Common grocery product database (expandable)
const PRODUCT_DATABASE: Record<string, string> = {
  // Sample barcodes - in production, use an API like Open Food Facts
  "5000159461122": "Heinz Tomato Ketchup",
  "5000112628357": "Coca-Cola",
  "8901030745645": "Basmati Rice",
  "041196910759": "Tomato Paste",
  "024100440603": "Black Beans",
  "041498126940": "Olive Oil",
  "041498200046": "Garlic Powder",
};

const BarcodeScanner = ({ onScan }: BarcodeScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const stopScanning = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  }, []);

  const lookupProduct = async (barcode: string): Promise<string> => {
    // Check local database first
    if (PRODUCT_DATABASE[barcode]) {
      return PRODUCT_DATABASE[barcode];
    }

    // Try Open Food Facts API
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();
      
      if (data.status === 1 && data.product?.product_name) {
        return data.product.product_name;
      }
    } catch (err) {
      console.log("Open Food Facts lookup failed:", err);
    }

    // Return generic name with barcode
    return `Product (${barcode})`;
  };

  const startScanning = useCallback(async () => {
    setError(null);
    setIsScanning(true);

    try {
      codeReaderRef.current = new BrowserMultiFormatReader();
      
      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error("No camera found");
      }

      // Prefer back camera
      const backCamera = videoInputDevices.find(
        (device) => device.label.toLowerCase().includes("back")
      );
      const deviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;

      await codeReaderRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        async (result, err) => {
          if (result) {
            const barcode = result.getText();
            
            // Prevent duplicate scans
            if (barcode !== lastScanned) {
              setLastScanned(barcode);
              
              // Lookup product name
              const productName = await lookupProduct(barcode);
              
              toast.success(`Scanned: ${productName}`);
              onScan(productName, barcode);
              
              // Brief pause before allowing next scan
              setTimeout(() => setLastScanned(null), 2000);
            }
          }
          
          if (err && !(err instanceof NotFoundException)) {
            console.error("Scan error:", err);
          }
        }
      );
    } catch (err: unknown) {
      console.error("Camera error:", err);
      setError(readErrorMessage(err) || "Failed to access camera");
      setIsScanning(false);
    }
  }, [lastScanned, onScan]);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => stopScanning();
  }, [isOpen, startScanning, stopScanning]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Camera className="w-4 h-4" />
        <span className="hidden sm:inline">Scan Barcode</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              Scan Grocery Barcode
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error ? (
              <Card className="p-6 text-center">
                <X className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive font-medium mb-2">Camera Error</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={startScanning}>Try Again</Button>
              </Card>
            ) : (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-32 border-2 border-primary rounded-lg relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                    
                    {/* Scanning line animation */}
                    <div className="absolute inset-x-2 h-0.5 bg-primary/50 animate-pulse top-1/2" />
                  </div>
                </div>

                {isScanning && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm">Scanning...</span>
                  </div>
                )}
              </div>
            )}

            {lastScanned && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last scanned:</p>
                    <p className="font-medium">{lastScanned}</p>
                  </div>
                </div>
              </Card>
            )}

            <p className="text-sm text-muted-foreground text-center">
              Position the barcode within the frame to scan. Products are automatically added to your pantry.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BarcodeScanner;
