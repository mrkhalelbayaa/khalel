import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ComparisonView } from './components/ComparisonView';
import { editImageWithGemini } from './services/geminiService';
import { ImageFile, GeneratedImage, PresetAction } from './types';
import { Wand2, Eraser, Image, Layers, Sparkles, Loader2, Info } from 'lucide-react';

const PRESETS: PresetAction[] = [
  { label: 'Remove Background', prompt: 'Remove the background and make it transparent', icon: <Eraser className="w-4 h-4" /> },
  { label: 'Studio Lighting', prompt: 'Enhance lighting to look like a professional studio product shot', icon: <Sparkles className="w-4 h-4" /> },
  { label: 'White Background', prompt: 'Place the object on a clean white background', icon: <Layers className="w-4 h-4" /> },
  { label: 'Black & White', prompt: 'Convert the image to artistic black and white', icon: <Image className="w-4 h-4" /> },
];

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (image: ImageFile) => {
    setOriginalImage(image);
    setGeneratedImage(null);
    setError(null);
    setPrompt('');
  };

  const handleGenerate = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!originalImage || !activePrompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const generatedBase64 = await editImageWithGemini(
        originalImage.base64,
        originalImage.mimeType,
        activePrompt
      );

      setGeneratedImage({
        imageUrl: generatedBase64,
        prompt: activePrompt
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-600 p-2 rounded-lg text-white">
               <Wand2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
              ProductLens AI
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-500 flex items-center">
            <span className="hidden sm:inline">Powered by Gemini 2.5 Flash</span>
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full border border-primary-200">Beta</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 md:pt-12">
        {/* Intro Section (only visible when no image selected) */}
        {!originalImage && (
          <div className="text-center mb-12 max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Professional Product Photos in <span className="text-primary-600">Seconds</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Upload your raw product shots and let AI clean them up. Remove backgrounds, fix lighting, or add creative effects with simple text commands.
            </p>
          </div>
        )}

        {/* Main Workspace */}
        <div className="grid gap-8">
          
          {/* Upload Area */}
          {!originalImage && (
             <div className="animate-in zoom-in-95 duration-300">
                <ImageUploader onImageSelected={handleImageSelected} isLoading={isLoading} />
             </div>
          )}

          {/* Editor Area (Visible after upload) */}
          {originalImage && !generatedImage && (
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left: Image Preview */}
                <div className="bg-slate-100 p-8 flex items-center justify-center border-r border-slate-100 min-h-[400px]">
                  <div className="relative group max-w-full max-h-[500px]">
                    <img 
                      src={originalImage.previewUrl} 
                      alt="Preview" 
                      className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm" 
                    />
                    <button 
                      onClick={resetAll} 
                      className="absolute top-2 right-2 p-2 bg-white/90 text-slate-600 rounded-full shadow-sm hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <Eraser className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right: Controls */}
                <div className="p-8 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">How should we edit this?</h3>
                    <p className="text-slate-500 text-sm">Choose a quick action or type your own instructions.</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setPrompt(preset.prompt);
                          handleGenerate(preset.prompt);
                        }}
                        disabled={isLoading}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-slate-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <div className="mb-2 p-2 bg-slate-100 rounded-full group-hover:bg-white text-slate-500 group-hover:text-primary-600 transition-colors">
                          {preset.icon}
                        </div>
                        <span className="text-sm font-medium">{preset.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-400">or custom prompt</span>
                    </div>
                  </div>

                  {/* Custom Input */}
                  <div className="relative flex-grow">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="E.g., Change the background to a marble countertop..."
                      className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 resize-none transition-all outline-none text-slate-700 placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                      disabled={isLoading}
                    />
                    
                    {error && (
                      <div className="mt-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start border border-red-100">
                         <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                         {error}
                      </div>
                    )}
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={() => handleGenerate()}
                    disabled={!prompt.trim() || isLoading}
                    className="mt-6 w-full py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-600/20 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing with Gemini...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Generate Edit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results View */}
          {originalImage && generatedImage && (
             <ComparisonView 
               original={originalImage} 
               generated={generatedImage} 
               onReset={() => setGeneratedImage(null)} 
             />
          )}

        </div>
      </main>

      {/* Loading Overlay (Optional for full screen lock, but using button loading for better UX) */}
      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} ProductLens AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;