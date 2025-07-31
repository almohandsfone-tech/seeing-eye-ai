import React, { useState, useRef, useEffect } from 'react';
import { ScanLine, Package, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onProductFound: (product: any) => void;
  className?: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onProductFound,
  className
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [productInfo, setProductInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        
        // Start barcode detection loop
        detectBarcode();
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      toast.error('تعذر الوصول للكاميرا / Camera access denied');
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsScanning(false);
    }
  };

  const detectBarcode = () => {
    // This is a simplified barcode detection
    // In a real app, you would use a library like QuaggaJS or ZXing
    if (!isScanning) return;
    
    setTimeout(() => {
      // Simulate barcode detection
      if (Math.random() > 0.95 && !scannedCode) {
        const mockBarcode = generateMockBarcode();
        setScannedCode(mockBarcode);
        lookupProduct(mockBarcode);
      } else {
        detectBarcode();
      }
    }, 100);
  };

  const generateMockBarcode = () => {
    const barcodes = [
      '1234567890123',
      '9876543210987',
      '5555555555555',
      '1111111111111'
    ];
    return barcodes[Math.floor(Math.random() * barcodes.length)];
  };

  const lookupProduct = async (barcode: string) => {
    setIsLoading(true);
    
    try {
      // Mock product lookup
      // In a real app, you would call a product database API
      const mockProducts: { [key: string]: any } = {
        '1234567890123': {
          name: 'نسكافيه كلاسيك',
          nameEn: 'Nescafe Classic',
          brand: 'نستله / Nestle',
          size: '200g',
          category: 'مشروبات / Beverages',
          price: '15 ريال',
          description: 'قهوة فورية كلاسيكية / Classic instant coffee'
        },
        '9876543210987': {
          name: 'حليب نادك',
          nameEn: 'Nadec Milk',
          brand: 'نادك / Nadec',
          size: '1L',
          category: 'منتجات الألبان / Dairy',
          price: '6 ريال',
          description: 'حليب طازج كامل الدسم / Fresh full-fat milk'
        },
        '5555555555555': {
          name: 'خبز التميمي',
          nameEn: 'Tamimi Bread',
          brand: 'التميمي / Tamimi',
          size: 'رغيف كبير / Large loaf',
          category: 'مخبوزات / Bakery',
          price: '3 ريال',
          description: 'خبز طازج / Fresh bread'
        }
      };

      const product = mockProducts[barcode] || {
        name: 'منتج غير معروف',
        nameEn: 'Unknown Product',
        brand: 'غير محدد / Unknown',
        barcode: barcode,
        description: 'لم يتم العثور على معلومات هذا المنتج'
      };

      setProductInfo(product);
      onProductFound(product);
      
      // Speak product name
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `تم العثور على: ${product.name}. ${product.description}`
        );
        utterance.lang = 'ar-SA';
        speechSynthesis.speak(utterance);
      }
      
      toast.success('تم العثور على المنتج / Product found');
      
    } catch (error) {
      console.error('Error looking up product:', error);
      toast.error('فشل في البحث عن المنتج / Failed to lookup product');
    } finally {
      setIsLoading(false);
    }
  };

  const resetScan = () => {
    setScannedCode('');
    setProductInfo(null);
    if (isScanning) {
      detectBarcode();
    }
  };

  return (
    <Card className={cn("overflow-hidden bg-gradient-card backdrop-blur-sm", className)}>
      <div className="p-4 bg-gradient-secondary text-secondary-foreground">
        <h2 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
          <ScanLine className="h-5 w-5" />
          قارئ الباركود - Barcode Scanner
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {!isScanning ? (
          // Scanner Setup
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <Package className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="text-lg font-medium">امسح الباركود</h3>
              <p className="text-sm text-muted-foreground">
                Point camera at product barcode to get information
              </p>
            </div>

            <Button
              onClick={startScanning}
              size="lg"
              className="w-full bg-gradient-primary hover:shadow-glow"
            >
              <ScanLine className="h-5 w-5 mr-2" />
              بدء المسح / Start Scanning
            </Button>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="text-sm font-medium mb-2">نصائح للمسح الأفضل:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• تأكد من وجود إضاءة جيدة</li>
                <li>• احمل المنتج على مسافة 10-15 سم من الكاميرا</li>
                <li>• تأكد من وضوح الباركود</li>
              </ul>
            </div>
          </div>
        ) : (
          // Active Scanner
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Scanning frame */}
                  <div className="w-64 h-32 border-4 border-primary rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                    
                    {/* Scanning line */}
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary animate-pulse" />
                  </div>
                  
                  <p className="text-white text-center mt-4 text-sm">
                    وضع الباركود داخل الإطار / Position barcode within frame
                  </p>
                </div>
              </div>

              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                    <p>جاري البحث... / Searching...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Scanner Status */}
            <div className="flex justify-between items-center">
              <Button onClick={stopScanning} variant="outline">
                إيقاف المسح / Stop Scan
              </Button>
              
              <div className="flex items-center gap-2">
                {scannedCode ? (
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    <Check className="h-3 w-3 mr-1" />
                    تم المسح / Scanned
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <ScanLine className="h-3 w-3 mr-1" />
                    جاري المسح / Scanning
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Information */}
        {productInfo && (
          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex justify-between items-center">
              <Button onClick={resetScan} variant="outline" size="sm">
                مسح آخر / Scan Another
              </Button>
              <h3 className="text-lg font-semibold text-success">معلومات المنتج</h3>
            </div>

            <Card className="p-4 bg-success/5 border border-success/20">
              <div className="space-y-3 text-right">
                <div>
                  <h4 className="text-lg font-bold">{productInfo.name}</h4>
                  <p className="text-sm text-muted-foreground">{productInfo.nameEn}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">العلامة التجارية:</span>
                    <p>{productInfo.brand}</p>
                  </div>
                  <div>
                    <span className="font-medium">الحجم:</span>
                    <p>{productInfo.size}</p>
                  </div>
                  <div>
                    <span className="font-medium">الفئة:</span>
                    <p>{productInfo.category}</p>
                  </div>
                  <div>
                    <span className="font-medium">السعر:</span>
                    <p>{productInfo.price}</p>
                  </div>
                </div>

                {productInfo.description && (
                  <div>
                    <span className="font-medium text-sm">الوصف:</span>
                    <p className="text-sm mt-1">{productInfo.description}</p>
                  </div>
                )}

                {scannedCode && (
                  <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                    الباركود: {scannedCode}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
};