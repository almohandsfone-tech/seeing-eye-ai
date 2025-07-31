import React, { useRef, useEffect, useState } from 'react';
import { Camera, Pause, Play, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  isProcessing: boolean;
  mode: string;
  className?: string;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCapture,
  isProcessing,
  mode,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    initCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageData);
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'object_detection': return 'كشف الأشياء - Object Detection';
      case 'scene_description': return 'وصف المشهد - Scene Description';
      case 'text_reading': return 'قراءة النص - Text Reading';
      case 'color_advisor': return 'مستشار الألوان - Color Advisor';
      case 'navigation_helper': return 'مساعد التنقل - Navigation Helper';
      default: return 'الكاميرا - Camera';
    }
  };

  if (hasPermission === null) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <Camera className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg">جاري تشغيل الكاميرا... / Initializing camera...</p>
      </Card>
    );
  }

  if (hasPermission === false) {
    return (
      <Card className={cn("p-8 text-center border-destructive", className)}>
        <Camera className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold mb-2">تعذر الوصول للكاميرا</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Camera access denied. Please allow camera permissions to use this feature.
        </p>
        <Button onClick={initCamera} variant="outline">
          إعادة المحاولة / Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Card className="overflow-hidden bg-gradient-card backdrop-blur-sm border-primary/20">
        <div className="p-4 bg-gradient-primary text-primary-foreground">
          <h2 className="text-lg font-semibold text-center">
            {getModeTitle()}
          </h2>
        </div>
        
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Overlay for visual guidance */}
          <div className="absolute inset-0 border-2 border-primary/30 m-4 rounded-lg">
            <div className="absolute top-2 left-2 right-2 h-0.5 bg-primary/50 animate-pulse" />
            <div className="absolute bottom-2 left-2 right-2 h-0.5 bg-primary/50 animate-pulse" />
          </div>

          {/* Processing indicator */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                <p className="text-lg">جاري التحليل... / Analyzing...</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-3 justify-center">
            <Button
              onClick={captureImage}
              disabled={!isStreaming || isProcessing}
              size="lg"
              className="flex-1 max-w-xs h-14 text-lg font-semibold bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Camera className="mr-2 h-6 w-6" />
              {isProcessing ? 'جاري المعالجة...' : 'التقاط / Capture'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              وجه الكاميرا نحو الهدف واضغط على زر الالتقاط
            </p>
            <p className="text-xs text-muted-foreground">
              Point camera at target and tap capture button
            </p>
          </div>
        </div>
      </Card>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};