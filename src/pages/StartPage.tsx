import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface StartPageProps {
  onStartNewLead: () => void;
}

const StartPage = ({ onStartNewLead }: StartPageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-12">
        
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          IMPERIA PROMO
        </h1>

        <Button 
          onClick={onStartNewLead}
          size="lg" 
          className="text-lg px-8 py-6 h-auto"
        >
          <Icon name="Plus" size={20} className="mr-2" />
          Новый лид
        </Button>

      </div>
    </div>
  );
};

export default StartPage;