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

  const sendToTelegram = async (type: 'запись' | 'брак') => {
    if (isSending) return; // Предотвращаем двойную отправку
    
    setIsSending(true);
    
    const statusIcon = type === 'запись' ? '✅' : '❌';
    const statusText = type === 'запись' ? 'ЗАПИСЬ' : 'БРАК';
    
    const message = `${statusIcon} ${statusText} - IMPERIA PROMO

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
      await sendViaTelegramBot(message, videoBlob, type);
      
    } catch (error: any) {
      console.error('🚫 Детальная ошибка отправки:', {
        message: error?.message || 'Неизвестная ошибка',
        stack: error?.stack,
        type: error?.name
      });
      
      let userMessage = '⚠️ Ошибка отправки в Telegram.';
      
      if (error?.message) {
        if (error.message.includes('файл') || error.message.includes('file') || error.message.includes('size')) {
          userMessage = '⚠️ Файл слишком большой для Telegram.\nПопробуйте записать более короткое видео.';
        } else if (error.message.includes('токен') || error.message.includes('token')) {
          userMessage = '⚠️ Проблема с настройками бота.\nОбратитесь к администратору.';
        } else if (error.message.includes('сеть') || error.message.includes('network')) {
          userMessage = '⚠️ Проблема с интернет-соединением.\nПроверьте подключение и попробуйте снова.';
        } else {
          userMessage = `⚠️ ${error.message}`;
        }
      }
      
      alert(`${userMessage}\n\nПожалуйста, попробуйте ещё раз или обратитесь к администратору.`);
    } finally {
      setIsSending(false);
    }
  };

  // Отправка через Telegram Bot API
  const sendViaTelegramBot = async (message: string, video: Blob, type: 'запись' | 'брак') => {
    // Показываем статус отправки
    console.log('🚀 Отправляем видео в Telegram...', {
      videoSize: video.size,
      videoType: video.type,
      parentName: formData.childName,
      type: type
    });
    
    try {
      // Логируем размер файла (лимит по весу убран)
      console.log(`Размер видео: ${(video.size / 1024 / 1024).toFixed(1)}MB`);
      // Лимит по размеру убран по запросу
      
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
      
      // Токены для разных типов отправки
      const BOT_TOKEN = type === 'запись' 
        ? '8286818285:AAGqkSsTlsbKCT1guKYoDpkL_OcldAVyuSE'
        : '8244106990:AAEVuBsj6sQDJ-a-qfwFRk0GMRHbyrGVuWc';
      
      console.log('🔗 Отправляем на URL:', `https://api.telegram.org/bot${BOT_TOKEN.substring(0, 10)}***/sendVideo`);
      
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
        method: 'POST',
        body: form,
        // Добавляем таймаут для больших файлов
        signal: AbortSignal.timeout(60000) // 60 секунд
      });

      console.log('📶 HTTP Status:', response.status, response.statusText);
      
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Ошибка парсинга JSON:', parseError);
        throw new Error('Неверный ответ от Telegram API');
      }
      
      console.log('📝 Ответ от Telegram:', result);

      if (!response.ok) {
        console.error('❌ Telegram API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: result
        });
        
        let errorMessage = `Ошибка ${response.status}`;
        
        if (result?.description) {
          if (result.description.includes('file size')) {
            errorMessage = 'Файл слишком большой для Telegram';
          } else if (result.description.includes('bot token')) {
            errorMessage = 'Неверный токен бота';
          } else if (result.description.includes('chat not found')) {
            errorMessage = 'Не найден чат или бот';
          } else {
            errorMessage = result.description;
          }
        }
        
        throw new Error(errorMessage);
      }

      console.log('✅ Успешная отправка:', result);
      alert(`✅ Видео (${type}) успешно отправлено в Telegram!\n\n🎯 IMPERIA PROMO - Данные отправлены`);
      
      // Автоматический переход на главную страницу
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (error: any) {
      console.error('🚫 Ошибка отправки:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Попытка отправить как документ, если видео не поддерживается
      if (error.message?.includes('Файл') || error.message?.includes('file')) {
        try {
          console.log('📄 Попытка отправить как документ...');
          
          const docForm = new FormData();
          docForm.append('chat_id', '5215501225');
          docForm.append('document', video, `${fileName}`);
          docForm.append('caption', message);
          
          const BOT_TOKEN = type === 'запись' 
            ? '8286818285:AAGqkSsTlsbKCT1guKYoDpkL_OcldAVyuSE'
            : '8244106990:AAEVuBsj6sQDJ-a-qfwFRk0GMRHbyrGVuWc';
            
          const docResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
            method: 'POST',
            body: docForm
          });
          
          if (docResponse.ok) {
            console.log('✅ Отправлено как документ');
            alert(`✅ Видео (${type}) отправлено как документ!`);
            setTimeout(() => onComplete(), 2000);
            return;
          }
        } catch (docError) {
          console.error('Ошибка отправки документа:', docError);
        }
      }
      
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

        <div className="space-y-4 w-full">
          <Button 
            onClick={() => sendToTelegram('запись')}
            disabled={isSending}
            size="lg"
            className="w-full text-lg px-8 py-6 h-auto bg-green-600 hover:bg-green-700"
          >
            {isSending ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Отправляем...
              </>
            ) : (
              <>
                <Icon name="CheckCircle" size={20} className="mr-2" />
                Запись
              </>
            )}
          </Button>

          <Button 
            onClick={() => sendToTelegram('брак')}
            disabled={isSending}
            size="lg"
            variant="destructive"
            className="w-full text-lg px-8 py-6 h-auto"
          >
            {isSending ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Отправляем...
              </>
            ) : (
              <>
                <Icon name="XCircle" size={20} className="mr-2" />
                Брак
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default SendPage;