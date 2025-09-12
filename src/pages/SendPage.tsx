import React, { useEffect, useState } from 'react';
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
    console.log('🚀 Отправляем видео в Telegram...', {
      videoSize: video.size,
      videoType: video.type,
      parentName: formData.childName
    });
    
    try {
      // Проверяем размер файла (Telegram лимит 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB в байтах
      if (video.size > maxSize) {
        throw new Error(`Файл слишком большой (${(video.size / 1024 / 1024).toFixed(1)}MB). Максимум 50MB.`);
      }
      
      // Создаем FormData для отправки видео
      const form = new FormData();
      form.append('chat_id', '5215501225');
      
      // Улучшенное определение расширения и MIME типа
      let extension = 'mp4';
      let mimeType = video.type;
      
      if (video.type.includes('webm')) {
        extension = 'webm';
      } else if (video.type.includes('mov') || video.type.includes('quicktime')) {
        extension = 'mov';
        mimeType = 'video/mp4'; // Конвертируем MOV в MP4 для Telegram
      } else if (video.type.includes('mp4') || !video.type) {
        extension = 'mp4';
        mimeType = 'video/mp4';
      }
      
      // Создаем новый Blob с правильным MIME типом если нужно
      const videoBlob = mimeType !== video.type ? new Blob([video], { type: mimeType }) : video;
      
      const fileName = `IMPERIA_PROMO_${formData.childName}_${Date.now()}.${extension}`;
      form.append('video', videoBlob, fileName);
      form.append('caption', message);
      form.append('parse_mode', 'HTML');
      
      console.log('Отправляем файл:', {
        name: fileName,
        size: videoBlob.size,
        type: videoBlob.type
      });
      
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
      
      // Автоматический переход на главную страницу
      setTimeout(() => {
        onComplete();
      }, 2000);
      
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-8 max-w-md mx-auto">
        
        <h1 className="text-2xl font-bold">IMPERIA PROMO</h1>

        <Button 
          onClick={sendToTelegram}
          disabled={isSending}
          size="lg"
          className="w-full text-lg px-8 py-6 h-auto"
        >
          {isSending ? (
            <>
              <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
              Отправляем...
            </>
          ) : (
            <>
              <Icon name="Send" size={20} className="mr-2" />
              Отправить в Telegram
            </>
          )}
        </Button>

      </div>
    </div>
  );
};

export default SendPage;