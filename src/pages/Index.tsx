import React, { useState, useCallback, useEffect } from 'react';
import { 
  Eye, 
  FileText, 
  Camera, 
  Mic, 
  Navigation, 
  Users, 
  Palette, 
  ScanLine,
  Settings,
  Volume2,
  Contrast,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CameraView } from '@/components/CameraView';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { FeatureCard } from '@/components/FeatureCard';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { RemoteAssistance } from '@/components/RemoteAssistance';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { NavigationHelper } from '@/components/NavigationHelper';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const [currentMode, setCurrentMode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(true);

  // Auto-start voice mode on mobile
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      setIsVoiceMode(true);
      // Auto-start listening after a brief delay
      setTimeout(() => {
        setIsListening(true);
      }, 1500);
    }
  }, []);

  const features = [
    {
      id: 'object_detection',
      title: 'كشف الأشياء',
      titleEn: 'Object Detection',
      description: 'يحدد الأشياء المحيطة بك ويصف مواقعها والمسافات',
      descriptionEn: 'Identifies surrounding objects and describes their positions and distances',
      icon: Eye
    },
    {
      id: 'text_reading',
      title: 'قراءة النصوص',
      titleEn: 'Text Reading',
      description: 'يقرأ النصوص المكتوبة من الكتب واللافتات والشاشات',
      descriptionEn: 'Reads written text from books, signs, and screens',
      icon: FileText
    },
    {
      id: 'scene_description',
      title: 'وصف المشهد',
      titleEn: 'Scene Description',
      description: 'يصف البيئة المحيطة بالتفصيل مثل راوي فيلم',
      descriptionEn: 'Describes the surrounding environment in detail like a movie narrator',
      icon: Camera
    },
    {
      id: 'color_advisor',
      title: 'مستشار الألوان',
      titleEn: 'Color Advisor',
      description: 'يساعدك في اختيار الملابس المتناسقة والألوان',
      descriptionEn: 'Helps you choose coordinated clothing and colors',
      icon: Palette
    },
    {
      id: 'navigation_helper',
      title: 'مساعد التنقل',
      titleEn: 'Navigation Helper',
      description: 'يوجهك بأمان أثناء المشي ويحذر من العقبات',
      descriptionEn: 'Guides you safely while walking and warns of obstacles',
      icon: Navigation
    },
    {
      id: 'barcode_scanner',
      title: 'قارئ الباركود',
      titleEn: 'Barcode Scanner',
      description: 'يقرأ الباركود ويخبرك بتفاصيل المنتج',
      descriptionEn: 'Reads barcodes and tells you product details',
      icon: ScanLine
    }
  ];

  const processImage = async (imageData: string, mode: string, prompt?: string) => {
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('ai-vision', {
        body: {
          image: imageData,
          mode: mode,
          prompt: prompt
        }
      });

      if (error) throw error;

      if (data.success) {
        setResult(data.description);
        toast.success('تم التحليل بنجاح / Analysis completed');
      } else {
        throw new Error(data.error || 'Failed to process image');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('فشل في تحليل الصورة / Failed to analyze image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeatureSelect = (featureId: string) => {
    setCurrentMode(featureId);
    setShowCamera(true);
    setResult('');
  };

  const handleVoiceCommand = useCallback((command: string) => {
    console.log('Voice command:', command);
    
    // Process voice commands
    const commandLower = command.toLowerCase();
    
    if (commandLower.includes('أمامي') || commandLower.includes('front') || commandLower.includes('object')) {
      handleFeatureSelect('object_detection');
    } else if (commandLower.includes('اقرأ') || commandLower.includes('read') || commandLower.includes('text')) {
      handleFeatureSelect('text_reading');
    } else if (commandLower.includes('صف') || commandLower.includes('describe') || commandLower.includes('scene')) {
      handleFeatureSelect('scene_description');
    } else if (commandLower.includes('ألوان') || commandLower.includes('color') || commandLower.includes('clothes')) {
      handleFeatureSelect('color_advisor');
    } else if (commandLower.includes('طريق') || commandLower.includes('navigate') || commandLower.includes('direction')) {
      handleFeatureSelect('navigation_helper');
    }
    
    setIsListening(false);
  }, []);

  const toggleAccessibility = (type: 'contrast' | 'text') => {
    if (type === 'contrast') {
      setHighContrast(!highContrast);
      document.body.classList.toggle('high-contrast', !highContrast);
    } else {
      setLargeText(!largeText);
      document.body.classList.toggle('large-text', !largeText);
    }
  };

  return (
    <div className={`mobile-viewport bg-background ${largeText ? 'large-text' : ''} ${highContrast ? 'high-contrast' : ''}`} dir="rtl">
      {/* Header */}
      <header className="bg-gradient-hero text-white p-4 md:p-6 shadow-lg safe-area-top">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleAccessibility('contrast')}
                className={`text-white hover:bg-white/20 ${highContrast ? 'bg-white/30' : ''}`}
              >
                <Contrast className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleAccessibility('text')}
                className={`text-white hover:bg-white/20 ${largeText ? 'bg-white/30' : ''}`}
              >
                <Type className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold">عينٌ لي</h1>
              <p className="text-lg opacity-90">أراك من أجلك</p>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-xl">مساعدك الذكي للرؤية بالذكاء الاصطناعي</p>
            <p className="text-sm opacity-80">Your AI-powered vision assistant</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Voice Assistant - Always prominent on mobile */}
        <div className="sticky top-4 z-10">
          <VoiceAssistant
            onVoiceCommand={handleVoiceCommand}
            isListening={isListening}
            onToggleListening={() => setIsListening(!isListening)}
            className={`${isListening ? 'voice-listening' : ''}`}
          />
        </div>

        {/* Features Grid */}
        {!showCamera && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">اختر الميزة</h2>
              <p className="text-muted-foreground">Choose a feature to get started</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  title={feature.title}
                  titleEn={feature.titleEn}
                  description={feature.description}
                  descriptionEn={feature.descriptionEn}
                  icon={feature.icon}
                  onClick={() => handleFeatureSelect(feature.id)}
                  isActive={currentMode === feature.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Camera View */}
        {showCamera && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowCamera(false)}
              >
                ← العودة / Back
              </Button>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {features.find(f => f.id === currentMode)?.title}
              </Badge>
            </div>

            <CameraView
              onCapture={(imageData) => processImage(imageData, currentMode)}
              isProcessing={isProcessing}
              mode={currentMode}
            />
          </div>
        )}

        {/* Results Display */}
        <ResultsDisplay
          result={result}
          mode={currentMode}
          isVisible={!!result}
        />

        {/* Hero Section for Empty State */}
        {!showCamera && !result && (
          <div className="text-center py-12">
            <img 
              src={heroImage} 
              alt="عينٌ لي - AI Vision Assistant"
              className="mx-auto mb-8 rounded-2xl shadow-feature max-w-md w-full"
            />
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">مرحباً بك في عينٌ لي</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                مساعدك الذكي الذي يساعدك على "الرؤية" والتفاعل مع العالم من حولك باستخدام الذكاء الاصطناعي
              </p>
              <p className="text-sm text-muted-foreground">
                Your intelligent assistant that helps you "see" and interact with the world around you using AI
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 text-center p-4 md:p-6 mt-8 md:mt-12 safe-area-bottom">
        <div className="space-y-2">
          <p className="text-sm font-medium">عينٌ لي - أراك من أجلك</p>
          <p className="text-xs text-muted-foreground">
            مدعوم بالذكاء الاصطناعي من أجل إمكانية الوصول الشاملة
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by AI for universal accessibility
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
