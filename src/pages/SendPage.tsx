import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface SendPageProps {
  formData: FormData;
  videoBlob: Blob;
  onBack: () => void;
  onComplete: () => void;
}

const SendPage = ({ formData, videoBlob, onBack, onComplete }: SendPageProps) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = 'Не удалось определить местоположение';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Доступ к геолокации запрещен';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Информация о местоположении недоступна';
            break;
          case error.TIMEOUT:
            errorMessage = 'Время ожидания геолокации истекло';
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  const sendToTelegram = async () => {
    if (isSending) return; // Предотвращаем двойную отправку
    
    setIsSending(true);
    
    const message = `🎯 НОВЫЙ ЛИД - IMPERIA PROMO

👨‍👩‍👧‍👦 ДАННЫЕ УЧАСТНИКА:
• Родитель: ${formData.parentName}
• Ребенок: ${formData.childName}
• Возраст: ${formData.age} лет
• Телефон: ${formData.phone}
• Промоутер: ${formData.promoter}

📍 МЕСТОПОЛОЖЕНИЕ:
${location ? `• Координаты: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
• Точность: ${location.accuracy.toFixed(0)} м
• Карта: https://maps.google.com/?q=${location.latitude},${location.longitude}` : '• Не определено'}

📹 Видео приложено

✨ Отправлено через IMPERIA PROMO APP`;

    try {
      // Отправка только через Telegram Bot API
      await sendViaTelegramBot(message, videoBlob);
      
    } catch (error) {
      console.error('Ошибка отправки через Telegram Bot API:', error);
      alert('⚠️ Ошибка отправки в Telegram.\n\nПожалуйста, попробуйте ещё раз или обратитесь к администратору.');
    } finally {
      setIsSending(false);
    }
  };

  // Отправка через Telegram Bot API
  const sendViaTelegramBot = async (message: string, video: Blob) => {
    // Показываем статус отправки
    console.log('🚀 Отправляем видео в Telegram...');
    
    try {
      // Создаем FormData для отправки видео
      const form = new FormData();
      form.append('chat_id', '5215501225');
      // Определяем расширение файла на основе MIME-типа
      const extension = video.type.includes('mp4') ? 'mp4' : 'webm';
      form.append('video', video, `IMPERIA_PROMO_${formData.childName}_${Date.now()}.${extension}`);
      form.append('caption', message);
      form.append('parse_mode', 'HTML');
      
      // Реальные данные бота
      const BOT_TOKEN = '8286818285:AAGqkSsTlsbKCT1guKYoDpkL_OcldAVyuSE';
      
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
        method: 'POST',
        body: form
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Telegram API Error:', result);
        throw new Error(`Telegram API Error: ${result.description || 'Неизвестная ошибка'}`);
      }

      console.log('Успешная отправка:', result);
      alert('✅ Видео успешно отправлено в Telegram!\n\n🎯 IMPERIA PROMO - Лид зарегистрирован');
      
    } catch (error) {
      console.error('Ошибка отправки:', error);
      throw error;
    }
  };

  const sendToWhatsApp = async () => {
    const message = `🎯 *НОВЫЙ ЛИД - IMPERIA PROMO*

👨‍👩‍👧‍👦 *ДАННЫЕ УЧАСТНИКА:*
• Родитель: ${formData.parentName}
• Ребенок: ${formData.childName}
• Возраст: ${formData.age} лет
• Телефон: ${formData.phone}
• Промоутер: ${formData.promoter}

📍 *МЕСТОПОЛОЖЕНИЕ:*
${location ? `• Координаты: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
• Точность: ${location.accuracy.toFixed(0)} м
• Карта: https://maps.google.com/?q=${location.latitude},${location.longitude}` : '• Не определено'}

📹 Видео приложено`;

    try {
      // Проверяем поддержку Web Share API для WhatsApp
      if (navigator.share && navigator.canShare) {
        const videoFile = new File([videoBlob], `lead_${formData.childName}_${Date.now()}.webm`, {
          type: 'video/webm'
        });

        const shareData = {
          title: 'Новый лид - IMPERIA PROMO',
          text: message,
          files: [videoFile]
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          alert('✅ Видео успешно отправлено!');
          return;
        }
      }

      // Fallback: обычная отправка через WhatsApp API
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Автоматически скачиваем видео
      downloadVideo();
      
      alert('✅ Текст отправлен в WhatsApp!\n📹 Видео скачивается...\n\n⬆️ Прикрепите скачанный видеофайл.');
      
    } catch (error) {
      console.error('Ошибка отправки в WhatsApp:', error);
      
      // Fallback: обычная отправка
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      downloadVideo();
      
      alert('⚠️ Отправка через браузер не поддерживается.\n📹 Видео скачивается...\n\nПрикрепите видео в WhatsApp вручную.');
    }
  };

  const downloadVideo = () => {
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    // Определяем расширение на основе MIME-типа
    const extension = videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
    a.download = `IMPERIA_PROMO_${formData.childName}_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button onClick={onBack} variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold">IMPERIA PROMO</h1>
              <p className="text-sm opacity-90">Отправка данных и видео</p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Подтверждение данных */}
          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Icon name="CheckCircle" size={24} className="text-green-600" />
                Данные готовы к отправке
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Данные участника */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-4">👨‍👩‍👧‍👦 Данные участника</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Родитель:</span>
                      <span className="font-medium">{formData.parentName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Ребенок:</span>
                      <span className="font-medium">{formData.childName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Возраст:</span>
                      <span className="font-medium">{formData.age} лет</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Телефон:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Промоутер:</span>
                      <span className="font-medium">{formData.promoter}</span>
                    </div>
                  </div>
                </div>

                {/* Местоположение и видео */}
                <div className="space-y-6">
                  
                  {/* Местоположение */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">📍 Местоположение</h3>
                    {isLoadingLocation ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="MapPin" size={16} />
                        <span>Определяем местоположение...</span>
                      </div>
                    ) : location ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <Icon name="MapPin" size={16} />
                          <span className="text-sm">Местоположение определено</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Широта: {location.latitude.toFixed(6)}</p>
                          <p>Долгота: {location.longitude.toFixed(6)}</p>
                          <p>Точность: {location.accuracy.toFixed(0)} м</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(`https://maps.google.com/?q=${location.latitude},${location.longitude}`, '_blank')}
                        >
                          <Icon name="ExternalLink" size={14} className="mr-1" />
                          Открыть на карте
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <Icon name="MapPinOff" size={16} />
                        <span className="text-sm">{locationError}</span>
                      </div>
                    )}
                  </div>

                  {/* Видео */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">📹 Видеозапись</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <Icon name="Video" size={16} />
                        <span className="text-sm">Видео готово к отправке</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Размер: {(videoBlob.size / 1024 / 1024).toFixed(2)} МБ</p>
                        <p>Формат: {videoBlob.type.includes('mp4') ? 'MP4' : 'WebM'}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={downloadVideo}
                      >
                        <Icon name="Download" size={14} className="mr-1" />
                        Скачать видео
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Отправка */}
          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Send" size={24} />
                Отправить данные
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-6">
                <p className="text-muted-foreground">
                  Выберите способ отправки данных с видео
                </p>
                
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">🤖 Отправка через Telegram Bot:</p>
                        <p>• Прямая отправка в чат клиента</p>
                        <p>• Видео + данные + геолокация</p>
                        <p>• Мгновенная доставка одним кликом</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <Button 
                      onClick={sendToTelegram}
                      disabled={isSending}
                      className="flex-1"
                      size="lg"
                    >
                      {isSending ? (
                        <>
                          <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                          Отправляем...
                        </>
                      ) : (
                        <>
                          <Icon name="Send" size={18} className="mr-2" />
                          Отправить в Telegram
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={sendToWhatsApp}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <Icon name="MessageCircle" size={18} className="mr-2" />
                      Отправить в WhatsApp
                    </Button>
                  </div>
                  
                  <div className="text-center pt-2">
                    <Button 
                      onClick={downloadVideo}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                    >
                      <Icon name="Download" size={16} className="mr-1" />
                      Скачать видео отдельно
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button 
                    onClick={onComplete}
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Icon name="Home" size={18} className="mr-2" />
                    Вернуться на главную
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SendPage;