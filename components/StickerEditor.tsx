import React, { useState, useCallback, useEffect, useRef } from 'react';
import { editSticker, analyzeImageWithThinking, removeBackground } from '../services/geminiService';
import Button from './common/Button';
import Loader from './common/Loader';
import Card from './common/Card';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const FONTS = ['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Impact', 'Comic Sans MS', 'Lobster', 'Pacifico', 'Bangers'];


interface StickerEditorProps {
  initialImage?: string;
}

const StickerEditor: React.FC<StickerEditorProps> = ({ initialImage }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(initialImage || null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Canvas and direct editing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  

  useEffect(() => {
    if (initialImage) {
      setOriginalImageUrl(initialImage);
      setEditedImageUrl(null);
      setAnalysis(null);
      setText('');
    }
  }, [initialImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImageUrl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    img.crossOrigin = 'anonymous'; 
    img.onload = () => {
        const MAX_WIDTH = 512;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        ctx.filter = 'none'; // Reset filter for text
        if (text.trim()) {
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Add a simple stroke for better visibility
            ctx.strokeStyle = 'black';
            ctx.lineWidth = Math.max(1, fontSize / 16);
            ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        }
    };
    img.src = originalImageUrl;
  }, [originalImageUrl, text, textColor, fontSize, fontFamily, brightness, contrast, saturation]);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setOriginalImageUrl(URL.createObjectURL(file));
      setEditedImageUrl(null);
      setAnalysis(null);
      setError(null);
    }
  };

  const handleEdit = useCallback(async () => {
    if ((!imageFile && !initialImage) || !editPrompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);
    try {
      let base64Data: string;
      let mimeType: string;

      if(imageFile) {
          base64Data = await fileToBase64(imageFile);
          mimeType = imageFile.type;
      } else if (originalImageUrl) {
          // If originalImageUrl is a blob url, we need to fetch and convert it
          if (originalImageUrl.startsWith('blob:')) {
            const response = await fetch(originalImageUrl);
            const blob = await response.blob();
            base64Data = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(blob);
            });
            mimeType = blob.type;
          } else {
             base64Data = originalImageUrl.split(',')[1];
             mimeType = originalImageUrl.match(/data:(.*);/)?.[1] || 'image/png';
          }
      } else {
        throw new Error("No image data available");
      }

      const resultUrl = await editSticker(base64Data, mimeType, editPrompt);
      setEditedImageUrl(resultUrl);
    } catch (err) {
      setError('Failed to edit sticker. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, editPrompt, originalImageUrl]);

  const handleAnalyze = useCallback(async () => {
    if (!originalImageUrl) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    try {
      let base64Data: string;
      let mimeType: string;

      if (imageFile) {
        base64Data = await fileToBase64(imageFile);
        mimeType = imageFile.type;
      } else if (originalImageUrl) {
         if (originalImageUrl.startsWith('blob:')) {
            const response = await fetch(originalImageUrl);
            const blob = await response.blob();
            base64Data = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(blob);
            });
            mimeType = blob.type;
          } else {
             base64Data = originalImageUrl.split(',')[1];
             mimeType = originalImageUrl.match(/data:(.*);/)?.[1] || 'image/png';
          }
      } else {
        throw new Error("No image data available");
      }

      const result = await analyzeImageWithThinking(base64Data, mimeType);
      setAnalysis(result);

    } catch (err) {
      setError('Deep analysis failed. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageFile, originalImageUrl]);
  
  const handleRemoveBackground = useCallback(async () => {
    if (!originalImageUrl) return;

    setIsRemovingBg(true);
    setError(null);
    try {
      let base64Data: string;
      let mimeType: string;

      if (imageFile) {
        base64Data = await fileToBase64(imageFile);
        mimeType = imageFile.type;
      } else if (originalImageUrl) {
         if (originalImageUrl.startsWith('blob:')) {
            const response = await fetch(originalImageUrl);
            const blob = await response.blob();
            base64Data = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(blob);
            });
            mimeType = blob.type;
          } else {
             base64Data = originalImageUrl.split(',')[1];
             mimeType = originalImageUrl.match(/data:(.*);/)?.[1] || 'image/png';
          }
      } else {
        throw new Error("No image data available");
      }
      
      const resultUrl = await removeBackground(base64Data, mimeType);
      setImageFile(null); // The original file is no longer relevant
      setOriginalImageUrl(resultUrl);

    } catch(err) {
        setError('Failed to remove background.');
        console.error(err);
    } finally {
        setIsRemovingBg(false);
    }
  }, [imageFile, originalImageUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'sticker.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
  };


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-papaya-pink">Sticker Editor</h2>
      <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Lobster&family=Pacifico&display=swap" rel="stylesheet" />
      
      <Card>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-600 mb-2">Upload Sticker</label>
        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-papaya-pink/10 file:text-papaya-pink hover:file:bg-papaya-pink/20"/>
        {!originalImageUrl && <p className="text-sm text-gray-500 mt-2">Or generate a sticker in the Generator tab to start.</p>}
      </Card>

      {originalImageUrl && (
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Main Editor Column */}
          <div className="space-y-4">
            <Card className="flex flex-col items-center gap-4">
              <h3 className="font-semibold text-lg">Editor Canvas</h3>
              <div className="bg-gray-100 bg-[linear-gradient(45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(-45deg,_#e5e7eb_25%,_transparent_25%),_linear-gradient(45deg,_transparent_75%,_#e5e7eb_75%),_linear-gradient(-45deg,_transparent_75%,_#e5e7eb_75%)] bg-[length:20px_20px] bg-position-[0_0,0_10px,10px_-10px,-10px_0px] p-2 rounded-lg border">
                <canvas ref={canvasRef} className="max-w-full h-auto" />
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-lg mb-4">Advanced Tools</h3>
              <div className="space-y-6">
                {/* BG Removal */}
                <div>
                   <Button onClick={handleRemoveBackground} disabled={isRemovingBg} className="w-full">
                    {isRemovingBg ? 'Working...' : '🪄 Remove Background'}
                  </Button>
                </div>

                {/* Text Overlay */}
                <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold">Text Overlay</h4>
                   <input type="text" placeholder="Add text..." value={text} onChange={(e) => setText(e.target.value)} className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg"/>
                   <div className="grid grid-cols-3 gap-2">
                      <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="p-2 bg-gray-100 border border-gray-300 rounded-lg text-sm">
                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 bg-gray-100 border-gray-300 rounded-lg cursor-pointer" />
                       <div>
                         <label className="text-xs text-gray-500">Size: {fontSize}px</label>
                         <input type="range" min="12" max="128" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full"/>
                       </div>
                   </div>
                </div>

                {/* Image Adjustments */}
                 <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                   <h4 className="font-semibold">Adjustments</h4>
                    <div>
                        <label className="text-xs text-gray-500">Brightness: {brightness}%</label>
                        <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} className="w-full"/>
                    </div>
                     <div>
                        <label className="text-xs text-gray-500">Contrast: {contrast}%</label>
                        <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(parseInt(e.target.value))} className="w-full"/>
                    </div>
                     <div>
                        <label className="text-xs text-gray-500">Saturation: {saturation}%</label>
                        <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(parseInt(e.target.value))} className="w-full"/>
                    </div>
                </div>

                <Button onClick={handleDownload} variant="secondary" className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white">
                    Download Final Sticker
                </Button>
              </div>
            </Card>
          </div>

          {/* Generative AI Column */}
          <div className="space-y-4">
            <Card>
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-lg">Generative AI Tools</h3>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g., Make it look like a watercolor painting"
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-papaya-pink focus:outline-none transition"
                  rows={2}
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleEdit} disabled={isLoading || !editPrompt.trim()}>
                    {isLoading ? 'Editing...' : '🎨 Apply Generative Edit'}
                  </Button>
                   <Button onClick={handleAnalyze} variant="secondary" disabled={isAnalyzing}>
                    {isAnalyzing ? 'Analyzing...' : '🧠 Deep Analysis'}
                  </Button>
                </div>
              </div>
            </Card>

            {isAnalyzing && <div className="flex justify-center p-4"><Loader text="Analyzing..." /></div>}
            {analysis && (
              <Card>
                <h3 className="font-semibold text-lg mb-2">Deep Analysis</h3>
                <div className="text-gray-600 whitespace-pre-wrap text-sm">{analysis}</div>
              </Card>
            )}

            {isLoading && <div className="flex justify-center p-4"><Loader text="Applying edit..." /></div>}
            {editedImageUrl && (
              <Card className="flex flex-col items-center gap-4">
                <h3 className="font-semibold text-lg">Generative Edit Result</h3>
                <img src={editedImageUrl} alt="Edited sticker" className="max-w-xs w-full h-auto rounded-lg shadow-lg bg-white/10 p-2" />
                 <a href={editedImageUrl} download="edited-sticker.png" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300">
                    Download Result
                  </a>
              </Card>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default StickerEditor;