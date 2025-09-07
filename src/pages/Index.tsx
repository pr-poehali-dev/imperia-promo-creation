import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface FormData {
  parentName: string;
  childName: string;
  age: string;
  phone: string;
  promoter: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

const Index = () => {
  const [formData, setFormData] = useState<FormData>({
    parentName: '',
    childName: '',
    age: '',
    phone: '',
    promoter: ''
  });

  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.error('Ошибка получения геолокации:', error);
      }
    );
  }, []);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: { exact: 'environment' }
        },
        audio: true
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Ошибка начала записи:', error);
      alert('Не удалось запустить запись. Проверьте разрешения камеры.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const retakeVideo = () => {
    setVideoBlob(null);
    setVideoUrl('');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const sendToTelegram = () => {
    const message = `Данные участника:
Имя родителя: ${formData.parentName}
Имя ребенка: ${formData.childName}
Возраст: ${formData.age}
Телефон: ${formData.phone}
Промоутер: ${formData.promoter}
${location ? `Местоположение: ${location.latitude}, ${location.longitude}` : ''}`;

    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  const sendToWhatsApp = () => {
    const message = `Данные участника:
Имя родителя: ${formData.parentName}
Имя ребенка: ${formData.childName}
Возраст: ${formData.age}
Телефон: ${formData.phone}
Промоутер: ${formData.promoter}
${location ? `Местоположение: ${location.latitude}, ${location.longitude}` : ''}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '');
  const canSend = isFormValid && videoBlob;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">Система видеорегистрации</h1>
          <p className="text-center mt-2 opacity-90">Заполните анкету и запишите видео</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          
          {/* Форма участника */}
          <Card className="h-fit">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" size={24} />
                Данные участника
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentName" className="text-sm font-medium">
                  Имя родителя *
                </Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => handleInputChange('parentName', e.target.value)}
                  placeholder="Введите имя родителя"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="childName" className="text-sm font-medium">
                  Имя ребенка *
                </Label>
                <Input
                  id="childName"
                  value={formData.childName}
                  onChange={(e) => handleInputChange('childName', e.target.value)}
                  placeholder="Введите имя ребенка"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  Возраст *
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Введите возраст"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Телефон *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="promoter" className="text-sm font-medium">
                  Имя промоутера *
                </Label>
                <Input
                  id="promoter"
                  value={formData.promoter}
                  onChange={(e) => handleInputChange('promoter', e.target.value)}
                  placeholder="Введите имя промоутера"
                  className="h-11"
                />
              </div>

              {location && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="MapPin" size={16} />
                    Местоположение определено
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Модуль записи видео */}
          <Card className="h-fit">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Video" size={24} />
                Запись видео (480p)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                  {!videoUrl ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {!stream && !videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Icon name="Camera" size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Нажмите "Начать запись"</p>
                      </div>
                    </div>
                  )}
                  
                  {isRecording && (
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        Идет запись
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {!isRecording && !videoUrl && (
                    <Button onClick={startRecording} className="flex-1">
                      <Icon name="Play" size={18} className="mr-2" />
                      Начать запись
                    </Button>
                  )}
                  
                  {isRecording && (
                    <Button onClick={stopRecording} variant="destructive" className="flex-1">
                      <Icon name="Square" size={18} className="mr-2" />
                      Остановить запись
                    </Button>
                  )}
                  
                  {videoUrl && (
                    <Button onClick={retakeVideo} variant="outline" className="flex-1">
                      <Icon name="RotateCcw" size={18} className="mr-2" />
                      Пересъемка
                    </Button>
                  )}
                </div>

                {canSend && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">
                      Отправить данные и видео:
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={sendToTelegram} className="flex-1" variant="outline">
                        <Icon name="Send" size={18} className="mr-2" />
                        Telegram
                      </Button>
                      <Button onClick={sendToWhatsApp} className="flex-1" variant="outline">
                        <Icon name="MessageCircle" size={18} className="mr-2" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;