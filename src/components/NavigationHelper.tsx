import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, AlertTriangle, Compass, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NavigationHelperProps {
  className?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number;
}

export const NavigationHelper: React.FC<NavigationHelperProps> = ({ className }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState('');
  const [directions, setDirections] = useState<string[]>([]);
  const [currentDirection, setCurrentDirection] = useState('');
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    let watchId: number;
    
    if (isNavigating && isLocationEnabled) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading || undefined
          };
          setCurrentLocation(locationData);
          provideTurnByTurnGuidance(locationData);
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('خطأ في تحديد الموقع / Location error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isNavigating, isLocationEnabled]);

  const checkLocationPermission = async () => {
    if ('geolocation' in navigator) {
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setIsLocationEnabled(true);
      } catch (error) {
        setIsLocationEnabled(false);
        console.error('Location permission denied:', error);
      }
    }
  };

  const startNavigation = async () => {
    if (!isLocationEnabled) {
      toast.error('الرجاء تفعيل خدمات الموقع / Please enable location services');
      return;
    }

    if (!destination.trim()) {
      toast.error('الرجاء إدخال الوجهة / Please enter destination');
      return;
    }

    setIsNavigating(true);
    
    // Mock directions - in a real app, you'd use a routing service
    const mockDirections = [
      'ابدأ بالمشي شمالاً لمسافة 100 متر / Start walking north for 100 meters',
      'انعطف يميناً عند الإشارة / Turn right at the traffic light', 
      'استمر مستقيماً لمسافة 200 متر / Continue straight for 200 meters',
      'انعطف يساراً في الشارع الثاني / Turn left at the second street',
      'وصلت إلى وجهتك / You have arrived at your destination'
    ];
    
    setDirections(mockDirections);
    setCurrentDirection(mockDirections[0]);
    
    // Speak first direction
    speakDirection(mockDirections[0]);
    
    toast.success('تم بدء التنقل / Navigation started');
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setDirections([]);
    setCurrentDirection('');
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    toast.success('تم إيقاف التنقل / Navigation stopped');
  };

  const speakDirection = (direction: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(direction);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const provideTurnByTurnGuidance = (location: LocationData) => {
    // Simulate turn-by-turn guidance based on location
    // In a real app, you'd use a routing service to calculate directions
    
    const currentIndex = directions.findIndex(dir => dir === currentDirection);
    if (currentIndex < directions.length - 1) {
      // Simulate progress through directions
      if (Math.random() > 0.7) {
        const nextDirection = directions[currentIndex + 1];
        setCurrentDirection(nextDirection);
        speakDirection(nextDirection);
        
        // Vibrate for haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    }
  };

  const repeatCurrentDirection = () => {
    if (currentDirection) {
      speakDirection(currentDirection);
    }
  };

  const quickDestinations = [
    'أقرب مسجد / Nearest mosque',
    'أقرب صيدلية / Nearest pharmacy', 
    'أقرب مطعم / Nearest restaurant',
    'أقرب محطة باص / Nearest bus stop',
    'أقرب مستشفى / Nearest hospital',
    'أقرب بنك / Nearest bank'
  ];

  return (
    <Card className={cn("overflow-hidden bg-gradient-card backdrop-blur-sm", className)}>
      <div className="p-4 bg-gradient-secondary text-secondary-foreground">
        <h2 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
          <Navigation className="h-5 w-5" />
          مساعد التنقل - Navigation Helper
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Location Status */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <Badge 
            variant={isLocationEnabled ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            <MapPin className="h-3 w-3" />
            {isLocationEnabled ? 'الموقع مفعل' : 'الموقع معطل'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {isLocationEnabled ? 'Location enabled' : 'Location disabled'}
          </span>
        </div>

        {!isNavigating ? (
          // Navigation Setup
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-right block">
                إلى أين تريد الذهاب؟
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="أدخل الوجهة / Enter destination"
                className="w-full p-3 border border-input rounded-lg text-right bg-background"
                dir="auto"
              />
            </div>

            {/* Quick Destinations */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">وجهات سريعة:</h4>
              <div className="grid grid-cols-2 gap-2">
                {quickDestinations.map((dest, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setDestination(dest)}
                    className="text-xs h-auto p-2 text-right"
                  >
                    {dest.split(' / ')[0]}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={startNavigation}
              disabled={!isLocationEnabled || !destination.trim()}
              size="lg"
              className="w-full bg-gradient-primary hover:shadow-glow"
            >
              <Route className="h-5 w-5 mr-2" />
              بدء التنقل / Start Navigation
            </Button>

            {!isLocationEnabled && (
              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">تفعيل خدمات الموقع مطلوب</p>
                    <p className="text-muted-foreground mt-1">
                      Location services required for navigation
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Active Navigation
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-success">التنقل نشط</h3>
              <p className="text-sm text-muted-foreground">إلى: {destination}</p>
            </div>

            {/* Current Direction */}
            <Card className="p-4 bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Compass className="h-6 w-6 text-primary mt-1 animate-pulse" />
                <div className="flex-1 text-right">
                  <p className="font-medium text-lg leading-relaxed">
                    {currentDirection}
                  </p>
                </div>
              </div>
            </Card>

            {/* Location Info */}
            {currentLocation && (
              <div className="p-3 bg-muted/30 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <span className="text-muted-foreground">دقة الموقع:</span>
                    <p className="font-medium">{Math.round(currentLocation.accuracy)}م</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الاتجاه:</span>
                    <p className="font-medium">
                      {currentLocation.heading ? `${Math.round(currentLocation.heading)}°` : 'غير محدد'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex gap-3">
              <Button
                onClick={repeatCurrentDirection}
                variant="outline"
                className="flex-1"
              >
                إعادة التوجيه / Repeat
              </Button>
              
              <Button
                onClick={stopNavigation}
                variant="destructive"
                className="flex-1"
              >
                إيقاف / Stop
              </Button>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>التقدم:</span>
                <span>{directions.findIndex(d => d === currentDirection) + 1} / {directions.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((directions.findIndex(d => d === currentDirection) + 1) / directions.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Safety Notice */}
        <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            تنبيهات السلامة:
          </h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• استخدم حواسك الأخرى أثناء المشي</li>
            <li>• تأكد من الطريق قبل العبور</li>
            <li>• اطلب المساعدة عند الحاجة</li>
            <li>• احمل هاتفك بطريقة آمنة</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};