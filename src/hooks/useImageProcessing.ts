
import { useState } from 'react';
import { AnalysisService } from '../services/analysis.service';
import { FileService } from '../services/file.service';
import type { InspectionFormData } from '../types/inspection';

export const useImageProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (
    imageData: File | string,
    onSuccess: (data: Partial<InspectionFormData>) => void
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      const fileService = FileService.getInstance();
      const analysisService = AnalysisService.getInstance();
      
      const base64Data = typeof imageData === 'string' 
        ? imageData 
        : await fileService.readFileAsBase64(imageData);
      
      const mimeType = typeof imageData === 'string'
        ? 'image/jpeg'
        : imageData.type;

      const extractedData = await analysisService.analyzeImage(base64Data, mimeType);
      onSuccess(extractedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  return { processImage, isProcessing, error };
};
