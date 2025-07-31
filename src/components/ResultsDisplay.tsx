import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Copy, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ResultsDisplayProps {
  result: string;
  mode: string;
  isVisible: boolean;
  className?: string;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  mode,
  isVisible,
  className
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  useEffect(() => {
    if (result && isVisible && autoSpeak) {
      speakResult();
    }
  }, [result, isVisible]);

  const speakResult = () => {
    if ('speechSynthesis' in window && result) {
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(result);
      
      // Detect language and set appropriate voice
      const isArabic = /[\u0600-\u06FF]/.test(result);
      utterance.lang = isArabic ? 'ar-SA' : 'en-US';
      utterance.rate = 0.8;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      toast.success('تم نسخ النص / Text copied');
    } catch (error) {
      toast.error('فشل في النسخ / Copy failed');
    }
  };

  const shareResult = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'عينٌ لي - AI Assistant Result',
          text: result,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard();
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'object_detection': return 'كشف الأشياء - Object Detection';
      case 'scene_description': return 'وصف المشهد - Scene Description';
      case 'text_reading': return 'قراءة النص - Text Reading';
      case 'color_advisor': return 'مستشار الألوان - Color Advisor';
      case 'navigation_helper': return 'مساعد التنقل - Navigation Helper';
      default: return 'النتيجة - Result';
    }
  };

  if (!isVisible || !result) {
    return null;
  }

  return (
    <Card className={cn(
      "overflow-hidden bg-gradient-card backdrop-blur-sm border-success/20 animate-in slide-in-from-bottom-4",
      className
    )}>
      <div className="p-4 bg-gradient-secondary text-secondary-foreground">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              onClick={isSpeaking ? stopSpeaking : speakResult}
              variant="ghost"
              size="sm"
              className="text-secondary-foreground hover:bg-white/20"
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="ghost"
              size="sm"
              className="text-secondary-foreground hover:bg-white/20"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              onClick={shareResult}
              variant="ghost"
              size="sm"
              className="text-secondary-foreground hover:bg-white/20"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <h3 className="text-lg font-semibold">
            {getModeTitle()}
          </h3>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-primary rounded-full animate-pulse" />
                <div className="w-1 h-4 bg-primary rounded-full animate-pulse delay-75" />
                <div className="w-1 h-4 bg-primary rounded-full animate-pulse delay-150" />
              </div>
              <span className="text-sm font-medium text-primary">
                جاري القراءة... / Speaking...
              </span>
            </div>
          )}

          {/* Result content */}
          <div className="prose prose-sm max-w-none text-right" dir="auto">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {result}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              onClick={speakResult}
              variant="outline"
              disabled={isSpeaking}
              className="flex-1"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              إعادة القراءة / Repeat
            </Button>
            
            <Button
              onClick={() => setAutoSpeak(!autoSpeak)}
              variant={autoSpeak ? "default" : "outline"}
              className="px-6"
            >
              {autoSpeak ? 'القراءة التلقائية مفعلة' : 'القراءة التلقائية معطلة'}
            </Button>
          </div>

          {/* Usage tip */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            اضغط على زر النسخ لحفظ النص أو المشاركة لإرساله
            <br />
            Tap copy to save text or share to send it
          </div>
        </div>
      </div>
    </Card>
  );
};