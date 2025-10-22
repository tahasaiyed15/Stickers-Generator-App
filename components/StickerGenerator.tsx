import React, { useState } from 'react';
import { generateSticker } from '../services/geminiService';
import Button from './common/Button';
import Loader from './common/Loader';
import Card from './common/Card';

interface StickerGeneratorProps {
  onStickerGenerated: (imageData: string) => void;
}

const StickerGenerator: React.FC<StickerGeneratorProps> = ({ onStickerGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageData = await generateSticker(prompt);
      setGeneratedImage(imageData);
    } catch (err) {
      setError('Failed to generate sticker. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (generatedImage) {
      onStickerGenerated(generatedImage);
    }
  };
  
  const popularPrompts = [
    "A cute cat wearing sunglasses",
    "A pineapple skateboarding",
    "A retro robot waving",
    "A kawaii style avocado",
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-papaya-pink">Sticker Generator</h2>
      <p className="text-center text-gray-600 max-w-xl mx-auto">
        Describe the sticker you want to create. Be as creative as you like! Our AI will bring your idea to life.
      </p>

      <Card className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A happy little papaya character waving hello"
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-papaya-pink focus:outline-none transition"
            rows={3}
          />
          <div className="text-sm text-gray-500">
            Feeling stuck? Try one of these:
            <div className="flex flex-wrap gap-2 mt-2">
                {popularPrompts.map(p => (
                    <button key={p} onClick={() => setPrompt(p)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs hover:bg-gray-300 transition">
                        {p}
                    </button>
                ))}
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
            {isLoading ? 'Generating...' : '✨ Generate Sticker'}
          </Button>
        </div>
      </Card>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {isLoading && <div className="flex justify-center p-4"><Loader /></div>}

      {generatedImage && (
        <Card className="max-w-sm mx-auto flex flex-col items-center gap-4">
          <h3 className="font-semibold text-lg">Your Sticker is Ready!</h3>
          <div className="bg-gray-100 bg-[linear-gradient(45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(-45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(45deg,_transparent_75%,_#e5e7eb_75%),_linear-gradient(-45deg,_transparent_75%,_#e5e7eb_75%)] bg-[length:20px_20px] bg-position-[0_0,0_10px,10px_-10px,-10px_0px] p-2 rounded-lg border">
            <img src={generatedImage} alt="Generated sticker" className="max-w-xs w-full h-auto rounded-lg shadow-lg" />
          </div>
          <div className="flex gap-4">
            <Button onClick={handleEdit} variant="primary">
              ✏️ Edit in Editor
            </Button>
             <a href={generatedImage} download="sticker.png" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 inline-flex items-center">
                Download
              </a>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StickerGenerator;
