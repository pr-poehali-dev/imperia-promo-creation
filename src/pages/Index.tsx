import React, { useState } from 'react';
import StartPage from './StartPage';
import FormPage from './FormPage';
import SendPage from './SendPage';

interface FormData {
  parentName: string;
  childName: string;
  age: string;
  phone: string;
  promoter: string;
}

type AppState = 'start' | 'form' | 'send';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<AppState>('start');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const handleStartNewLead = () => {
    setCurrentPage('form');
  };

  const handleFormNext = (data: FormData, video: Blob) => {
    setFormData(data);
    setVideoBlob(video);
    setCurrentPage('send');
  };

  const handleFormBack = () => {
    setCurrentPage('start');
  };

  const handleSendBack = () => {
    setCurrentPage('form');
  };

  const handleComplete = () => {
    setFormData(null);
    setVideoBlob(null);
    setCurrentPage('start');
  };

  if (currentPage === 'start') {
    return <StartPage onStartNewLead={handleStartNewLead} />;
  }

  if (currentPage === 'form') {
    return (
      <FormPage 
        onNext={handleFormNext}
        onBack={handleFormBack}
      />
    );
  }

  if (currentPage === 'send' && formData && videoBlob) {
    return (
      <SendPage 
        formData={formData}
        videoBlob={videoBlob}
        onBack={handleSendBack}
        onComplete={handleComplete}
      />
    );
  }

  return <StartPage onStartNewLead={handleStartNewLead} />;
};

export default Index;