import React, { useState } from 'react';
import { Download, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import { ImageFile, GeneratedImage } from '../types';

interface ComparisonViewProps {
  original: ImageFile;
  generated: GeneratedImage;
  onReset: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ original, generated, onReset }) => {
  const [viewMode, setViewMode] = useState<'split' | 'overlay'>('split');
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generated.imageUrl;
    link.download = `edited-product-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Result</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setViewMode(viewMode === 'split' ? 'overlay' : 'split')}
            className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Toggle View"
          >
            {viewMode === 'split' ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className={`
        relative bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm
        ${viewMode === 'split' ? 'grid md:grid-cols-2 gap-0.5 bg-slate-200' : 'h-[500px] flex items-center justify-center'}
      `}>
        
        {/* Original Image Container */}
        <div className={`relative bg-white flex items-center justify-center overflow-hidden ${viewMode === 'split' ? 'h-[300px] md:h-[500px]' : 'absolute inset-0 z-0'}`}>
           {viewMode === 'split' && (
              <span className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">Original</span>
           )}
           <img 
              src={original.previewUrl} 
              alt="Original" 
              className="w-full h-full object-contain"
            />
        </div>

        {/* Generated Image Container */}
        <div className={`relative bg-white flex items-center justify-center overflow-hidden ${viewMode === 'split' ? 'h-[300px] md:h-[500px]' : 'absolute inset-0 z-10 hover:opacity-0 transition-opacity duration-300 cursor-help'}`}>
           <span className="absolute top-4 right-4 bg-primary-600/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10 shadow-lg">
             {viewMode === 'overlay' ? 'Hover to see original' : 'Edited'}
           </span>
           <img 
              src={generated.imageUrl} 
              alt="Generated" 
              className="w-full h-full object-contain bg-[url('https://www.transparenttextures.com/patterns/checkerboard-white-gray.png')]" // Subtle checkerboard for transparency check
            />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
        <div className="text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 w-full sm:w-auto text-center sm:text-left">
          <span className="font-semibold mr-2">Prompt:</span>
          {generated.prompt}
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button 
            onClick={onReset}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Edit
          </button>
          
          <button 
            onClick={handleDownload}
            className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};