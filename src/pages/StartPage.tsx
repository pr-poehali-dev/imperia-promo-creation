import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface StartPageProps {
  onStartNewLead: () => void;
}

const StartPage = ({ onStartNewLead }: StartPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          
          {/* Logo Section */}
          <div className="mb-16">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-primary rounded-full mb-8 shadow-2xl">
              <Icon name="Crown" size={50} className="text-primary-foreground" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-8">
              IMPERIA PROMO
            </h1>
          </div>

          {/* Main CTA */}
          <div>
            <Button 
              onClick={onStartNewLead}
              size="lg" 
              className="text-xl px-16 py-8 h-auto shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <Icon name="Plus" size={24} className="mr-3" />
              Новый лид
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartPage;