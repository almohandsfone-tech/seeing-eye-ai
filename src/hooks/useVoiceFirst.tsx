import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceFirstOptions {
  autoStart?: boolean;
  wakeWord?: string;
  continuousListening?: boolean;
}

export const useVoiceFirst = (options: VoiceFirstOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { autoStart = false, wakeWord = 'عين', continuousListening = true } = options;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      
      recognition.continuous = continuousListening;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        // Auto-restart if continuous mode is enabled
        if (continuousListening && isListening) {
          setTimeout(() => {
            recognition.start();
          }, 100);
        }
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          // Check for wake word
          if (wakeWord && finalTranscript.toLowerCase().includes(wakeWord.toLowerCase())) {
            handleWakeWordDetection(finalTranscript);
          }
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('يرجى السماح بالوصول للميكروفون / Please allow microphone access');
        }
      };
      
      recognitionRef.current = recognition;
      
      // Auto-start if enabled
      if (autoStart) {
        setTimeout(() => startListening(), 1000);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [autoStart, wakeWord, continuousListening]);

  const handleWakeWordDetection = useCallback((transcript: string) => {
    // Vibrate if available (mobile)
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // Visual feedback
    document.body.classList.add('voice-command-active');
    setTimeout(() => {
      document.body.classList.remove('voice-command-active');
    }, 1000);
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && isSupported) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const speak = useCallback((text: string, language: string = 'ar-SA') => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.volume = 1;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
      
      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setTranscript
  };
};