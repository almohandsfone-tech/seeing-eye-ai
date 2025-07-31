import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Smartphone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useVoiceFirst } from '@/hooks/useVoiceFirst';

interface VoiceAssistantProps {
  onVoiceCommand: (command: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  className?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onVoiceCommand,
  isListening,
  onToggleListening,
  className
}) => {
  const voiceFirst = useVoiceFirst({ 
    autoStart: true, 
    wakeWord: 'عين',
    continuousListening: false 
  });
  
  // Use voice-first hook for enhanced mobile experience
  const [quickCommandMode, setQuickCommandMode] = useState(false);

  // Enhanced voice command processing
  useEffect(() => {
    if (voiceFirst.transcript) {
      onVoiceCommand(voiceFirst.transcript);
      voiceFirst.setTranscript('');
    }
  }, [voiceFirst.transcript, onVoiceCommand]);

  // Quick command shortcuts for mobile
  const handleQuickCommand = (command: string) => {
    voiceFirst.speak(`تنفيذ ${command}`);
    onVoiceCommand(command);
    setQuickCommandMode(false);
  };

  const commonCommands = [
    { ar: 'ما الذي أمامي؟', en: 'What is in front of me?', command: 'object_detection' },
    { ar: 'اقرأ النص', en: 'Read the text', command: 'text_reading' },
    { ar: 'صف المشهد', en: 'Describe the scene', command: 'scene_description' },
    { ar: 'ألوان الملابس', en: 'Clothing colors', command: 'color_advisor' },
  ];

  if (!voiceFirst.isSupported) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <MicOff className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg mb-2">المساعد الصوتي غير متاح</p>
        <p className="text-sm text-muted-foreground">
          Voice assistant not supported on this device
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden bg-gradient-card backdrop-blur-sm border-2 border-primary/20", className)}>
      <div className="p-3 md:p-4 bg-gradient-secondary text-secondary-foreground">
        <div className="flex items-center justify-center gap-2">
          <Smartphone className="h-5 w-5" />
          <h2 className="text-base md:text-lg font-semibold text-center">
            المساعد الصوتي - Voice Assistant
          </h2>
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            صوت أولاً
          </Badge>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Main Voice Control */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="relative">
            <Button
              onClick={() => {
                if (voiceFirst.isListening) {
                  voiceFirst.stopListening();
                } else {
                  voiceFirst.startListening();
                }
                onToggleListening();
              }}
              size="lg"
              variant={voiceFirst.isListening ? "destructive" : "default"}
              className={cn(
                "h-24 w-24 md:h-20 md:w-20 rounded-full text-2xl transition-all duration-300 shadow-lg",
                voiceFirst.isListening 
                  ? "bg-destructive hover:bg-destructive/90 animate-pulse shadow-glow scale-110" 
                  : "bg-gradient-primary hover:shadow-glow active:scale-95"
              )}
            >
              {voiceFirst.isListening ? <MicOff className="h-10 w-10 md:h-8 md:w-8" /> : <Mic className="h-10 w-10 md:h-8 md:w-8" />}
            </Button>
            
            {voiceFirst.isListening && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-destructive/30 animate-ping" />
                <div className="absolute inset-0 rounded-full border-2 border-destructive/50 animate-pulse" />
              </>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-lg md:text-xl font-medium">
              {voiceFirst.isListening ? 'أنا أستمع...' : 'اضغط للتحدث'}
            </p>
            <p className="text-sm md:text-base text-muted-foreground">
              {voiceFirst.isListening ? 'Listening...' : 'Tap to speak'}
            </p>
            {voiceFirst.isListening && (
              <p className="text-xs text-primary animate-pulse">
                قل "عين" لإيقاظ المساعد | Say "عين" to wake assistant
              </p>
            )}
          </div>

          {voiceFirst.transcript && (
            <div className="p-3 md:p-4 bg-muted rounded-lg slide-up">
              <p className="text-sm text-muted-foreground mb-1">آخر أمر:</p>
              <p className="font-medium text-sm md:text-base">{voiceFirst.transcript}</p>
            </div>
          )}
        </div>

        {/* Enhanced Mobile Controls */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={voiceFirst.stopSpeaking}
            variant="outline"
            disabled={!voiceFirst.isSpeaking}
            className="h-12 text-sm font-medium"
          >
            <VolumeX className="mr-2 h-4 w-4" />
            إيقاف الصوت
          </Button>
          <Button
            onClick={() => voiceFirst.speak('مرحبا، أنا عينك الذكية. كيف يمكنني مساعدتك؟')}
            variant="outline"
            disabled={voiceFirst.isSpeaking}
            className="h-12 text-sm font-medium"
          >
            <Volume2 className="mr-2 h-4 w-4" />
            اختبار الصوت
          </Button>
        </div>

        {/* Quick Action Mode Toggle */}
        <div className="text-center">
          <Button
            onClick={() => setQuickCommandMode(!quickCommandMode)}
            variant="ghost"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            {quickCommandMode ? 'إخفاء الأوامر السريعة' : 'إظهار الأوامر السريعة'}
          </Button>
        </div>

        {/* Quick Commands - Mobile Optimized */}
        {quickCommandMode && (
          <div className="space-y-3 slide-up">
            <h3 className="text-sm font-medium text-center">أوامر سريعة - Quick Commands</h3>
            <div className="grid grid-cols-2 gap-2">
              {commonCommands.map((cmd, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-16 p-2 text-center hover:bg-muted/50 border border-muted"
                  onClick={() => handleQuickCommand(cmd.command)}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-medium leading-tight">{cmd.ar}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{cmd.en}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Usage Tips */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            نصائح للجوال:
          </h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• اضغط مطولاً للاستمرار في الاستماع</li>
            <li>• قل "عين" لإيقاظ المساعد</li>
            <li>• استخدم الأوامر السريعة للوصول المباشر</li>
            <li>• التطبيق يدعم الاهتزاز للتأكيد</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};