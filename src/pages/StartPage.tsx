import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface StartPageProps {
  onStartNewLead: () => void;
}

const StartPage = ({ onStartNewLead }: StartPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Logo Section */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-full mb-6">
              <Icon name="Crown" size={40} className="text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              IMPERIA PROMO
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              Система управления лидами и видеорегистрации
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon name="Users" size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Управление лидами</h3>
                <p className="text-sm text-muted-foreground">
                  Удобная система сбора и обработки данных клиентов
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon name="Video" size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Видеозапись</h3>
                <p className="text-sm text-muted-foreground">
                  Качественная запись видео с мобильных устройств
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon name="Send" size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Быстрая отправка</h3>
                <p className="text-sm text-muted-foreground">
                  Мгновенная передача данных в мессенджеры
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main CTA */}
          <div className="space-y-4">
            <Button 
              onClick={onStartNewLead}
              size="lg" 
              className="text-lg px-12 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow"
            >
              <Icon name="Plus" size={20} className="mr-2" />
              Новый лид
            </Button>
            <p className="text-sm text-muted-foreground">
              Начните процесс регистрации нового участника
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 pt-8 border-t border-border/50">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Надежность</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">480p</div>
                <div className="text-sm text-muted-foreground">Качество видео</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">∞</div>
                <div className="text-sm text-muted-foreground">Лидов</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartPage;