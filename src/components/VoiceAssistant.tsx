import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA'; // Arabic Saudi Arabia, can be switched to 'en-US'

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          onVoiceCommand(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onVoiceCommand]);

  useEffect(() => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.start();
      } else {
        recognitionRef.current.stop();
      }
    }
  }, [isListening]);

  const speak = (text: string, lang: string = 'ar-SA') => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
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

  const commonCommands = [
    { ar: 'ما الذي أمامي؟', en: 'What is in front of me?', command: 'object_detection' },
    { ar: 'اقرأ النص', en: 'Read the text', command: 'text_reading' },
    { ar: 'صف المشهد', en: 'Describe the scene', command: 'scene_description' },
    { ar: 'ألوان الملابس', en: 'Clothing colors', command: 'color_advisor' },
  ];

  if (!isSupported) {
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
    <Card className={cn("overflow-hidden bg-gradient-card backdrop-blur-sm", className)}>
      <div className="p-4 bg-gradient-secondary text-secondary-foreground">
        <h2 className="text-lg font-semibold text-center">
          المساعد الصوتي - Voice Assistant
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Voice Control */}
        <div className="text-center space-y-4">
          <div className="relative">
            <Button
              onClick={onToggleListening}
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className={cn(
                "h-20 w-20 rounded-full text-2xl transition-all duration-300",
                isListening 
                  ? "bg-destructive hover:bg-destructive/90 animate-pulse shadow-glow" 
                  : "bg-gradient-primary hover:shadow-glow"
              )}
            >
              {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
            
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-destructive/30 animate-ping" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isListening ? 'أنا أستمع...' : 'اضغط للتحدث'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isListening ? 'Listening...' : 'Tap to speak'}
            </p>
          </div>

          {transcript && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">آخر أمر:</p>
              <p className="font-medium">{transcript}</p>
            </div>
          )}
        </div>

        {/* Speech Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={stopSpeaking}
            variant="outline"
            disabled={!isSpeaking}
            className="flex-1 max-w-32"
          >
            <VolumeX className="mr-2 h-4 w-4" />
            إيقاف
          </Button>
          <Button
            onClick={() => speak('مرحبا، أنا مساعدك الصوتي. كيف يمكنني مساعدتك؟')}
            variant="outline"
            disabled={isSpeaking}
            className="flex-1 max-w-32"
          >
            <Volume2 className="mr-2 h-4 w-4" />
            اختبار
          </Button>
        </div>

        {/* Quick Commands */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-center">أوامر سريعة - Quick Commands</h3>
          <div className="grid grid-cols-1 gap-2">
            {commonCommands.map((cmd, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start text-right h-auto p-3 hover:bg-muted/50"
                onClick={() => onVoiceCommand(cmd.command)}
              >
                <div className="w-full text-right space-y-1">
                  <p className="text-sm font-medium">{cmd.ar}</p>
                  <p className="text-xs text-muted-foreground">{cmd.en}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Usage Tips */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="text-sm font-medium mb-2">نصائح الاستخدام:</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• تحدث بوضوح وببطء</li>
            <li>• استخدم الأوامر المعروضة أعلاه</li>
            <li>• يمكنك التبديل بين العربية والإنجليزية</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};