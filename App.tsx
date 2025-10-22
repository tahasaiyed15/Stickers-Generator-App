import React, { useState } from 'react';
import Header from './components/Header';
import StickerGenerator from './components/StickerGenerator';
import StickerEditor from './components/StickerEditor';
import SupportChat from './components/SupportChat';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.GENERATOR);
  const [imageForEditor, setImageForEditor] = useState<string | undefined>(undefined);

  const handleStickerGenerated = (imageData: string) => {
    setImageForEditor(imageData);
    setCurrentView(View.EDITOR);
  };

  const renderView = () => {
    switch (currentView) {
      case View.GENERATOR:
        return <StickerGenerator onStickerGenerated={handleStickerGenerated} />;
      case View.EDITOR:
        return <StickerEditor initialImage={imageForEditor} />;
      case View.SUPPORT:
        return <SupportChat />;
      default:
        return <StickerGenerator onStickerGenerated={handleStickerGenerated} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-light-gray">
      <Header currentView={currentView} setView={setCurrentView} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
      <footer className="text-center p-4 text-xs text-gray-400">
        AI tools powered by Google Gemini.
      </footer>
    </div>
  );
};

export default App;