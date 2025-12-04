import React, { useCallback, useRef, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  onImageSelected: (image: ImageFile) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    
    // Max size check (e.g., 10MB to be safe for API limits, though Gemini is generous)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Please upload an image under 10MB.');
      return;
    }

    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 data and mime type
      // format: data:image/png;base64,.....
      const [prefix, base64] = result.split(',');
      const mimeType = prefix.match(/:(.*?);/)?.[1] || file.type;

      onImageSelected({
        file,
        previewUrl: result,
        base64,
        mimeType
      });
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-in-out
          flex flex-col items-center justify-center text-center cursor-pointer group
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 scale-[1.01]' 
            : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'}
          ${isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileInputChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          disabled={isLoading}
        />
        
        <div className={`p-4 rounded-full bg-primary-50 text-primary-600 mb-4 group-hover:scale-110 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
          <Upload className="w-8 h-8" />
        </div>
        
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          {isDragging ? 'Drop image here' : 'Upload a product photo'}
        </h3>
        
        <p className="text-slate-500 text-sm max-w-xs">
          Drag and drop or click to select. Supports JPG, PNG, WebP up to 10MB.
        </p>

        {error && (
          <div className="absolute -bottom-12 left-0 right-0 mx-auto flex items-center justify-center text-red-500 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};