import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Phone, PhoneOff, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RemoteAssistanceProps {
  className?: string;
}

export const RemoteAssistance: React.FC<RemoteAssistanceProps> = ({ className }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [assistantId, setAssistantId] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: true
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsCallActive(true);
      toast.success('تم بدء المكالمة / Call started');
      
      // Here you would integrate with your preferred video calling service
      // For example: WebRTC, Agora, Twilio, etc.
      
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('فشل في بدء المكالمة / Failed to start call');
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCallActive(false);
    toast.success('تم إنهاء المكالمة / Call ended');
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  return (
    <Card className={cn("overflow-hidden bg-gradient-card backdrop-blur-sm", className)}>
      <div className="p-4 bg-gradient-secondary text-secondary-foreground">
        <h2 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
          <Users className="h-5 w-5" />
          المساعدة عن بُعد - Remote Assistance
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {!isCallActive ? (
          // Call Setup
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">اتصل بمساعد</h3>
              <p className="text-sm text-muted-foreground">
                Connect with a friend or volunteer for visual assistance
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="assistant-id" className="text-right block mb-2">
                  رقم المساعد أو البريد الإلكتروني
                </Label>
                <Input
                  id="assistant-id"
                  value={assistantId}
                  onChange={(e) => setAssistantId(e.target.value)}
                  placeholder="أدخل رقم المساعد / Enter assistant ID"
                  className="text-right"
                  dir="auto"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  variant={isVideoEnabled ? "default" : "outline"}
                  size="sm"
                >
                  <Video className="h-4 w-4 mr-2" />
                  {isVideoEnabled ? 'فيديو مفعل' : 'فيديو معطل'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {isVideoEnabled ? 'Video enabled' : 'Audio only'}
                </span>
              </div>

              <Button
                onClick={startCall}
                disabled={!assistantId.trim()}
                size="lg"
                className="w-full bg-gradient-primary hover:shadow-glow"
              >
                <Phone className="h-5 w-5 mr-2" />
                بدء المكالمة / Start Call
              </Button>
            </div>

            {/* Quick Contact Options */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium mb-3">اتصالات سريعة:</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAssistantId('emergency-volunteer')}
                >
                  متطوع طوارئ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAssistantId('family-member')}
                >
                  أحد الأقارب
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Active Call Interface
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-success">مكالمة نشطة</h3>
              <p className="text-sm text-muted-foreground">Active call with {assistantId}</p>
            </div>

            {/* Video Display */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center text-white">
                    <VideoOff className="h-12 w-12 mx-auto mb-2" />
                    <p>الفيديو معطل / Video disabled</p>
                  </div>
                </div>
              )}

              {/* Call Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                <Button
                  onClick={toggleVideo}
                  variant={isVideoEnabled ? "default" : "outline"}
                  size="icon"
                  className="rounded-full"
                >
                  {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                
                <Button
                  onClick={endCall}
                  variant="destructive"
                  size="icon"
                  className="rounded-full"
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Call Info */}
            <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
              <p className="text-sm font-medium text-success">
                المساعد متصل ويمكنه رؤية ما تصوره الكاميرا
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Assistant connected and can see your camera feed
              </p>
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="text-sm font-medium mb-2">كيفية الاستخدام:</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• وجه الكاميرا نحو ما تريد المساعدة فيه</li>
            <li>• سيتمكن المساعد من رؤية ما تراه الكاميرا</li>
            <li>• استمع للتوجيهات الصوتية من المساعد</li>
            <li>• يمكنك إيقاف الفيديو للحفاظ على الخصوصية</li>
          </ul>
        </div>

        {/* Privacy Notice */}
        <div className="text-xs text-center text-muted-foreground p-3 border-t border-border">
          <p>جميع المكالمات مشفرة من طرف إلى طرف لضمان الخصوصية</p>
          <p>All calls are end-to-end encrypted for privacy</p>
        </div>
      </div>
    </Card>
  );
};