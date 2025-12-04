import React from 'react';

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
}

export interface PresetAction {
  label: string;
  prompt: string;
  icon: React.ReactNode;
}