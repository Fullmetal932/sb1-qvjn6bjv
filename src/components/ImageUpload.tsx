import React, { useState, useCallback, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Upload, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { AnalysisService } from '../services/analysis.service';
import { logger } from '../utils/logger';
import CameraOverlay from './CameraOverlay';
import type { InspectionFormData } from '../types/inspection';

interface ImageUploadProps {
  onImageCapture: (imageData: string) => void;
  onTextExtracted: (data: Partial<InspectionFormData>) => void;
  imageData: string | null;
}

const MAX_FILE_SIZE_MB = 4;
const SCROLL_DELAY = 300; // ms to wait for DOM updates

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageCapture,
  onTextExtracted,
  imageData
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number>();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToImageAndProcessing = useCallback(() => {
    if (imageContainerRef.current && window.innerWidth <= 768) {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      // Set new timeout to allow DOM updates to complete
      scrollTimeoutRef.current = window.setTimeout(() => {
        const imageElement = imageContainerRef.current?.querySelector('img');
        if (imageElement) {
          const isPortrait = imageElement.naturalHeight > imageElement.naturalWidth;
          if (isPortrait) {
            const imageRect = imageContainerRef.current.getBoundingClientRect();
            const processingRect = processingRef.current?.getBoundingClientRect();
            
            if (processingRect) {
              const totalHeight = processingRect.bottom - imageRect.top;
              const viewportHeight = window.innerHeight;
              const currentScroll = window.pageYOffset;
              
              // Calculate optimal scroll position
              const targetScroll = currentScroll + (totalHeight - viewportHeight + 40);
              
              window.scrollTo({
                top: Math.max(0, targetScroll),
                behavior: 'smooth'
              });
            }
          }
        }
      }, SCROLL_DELAY);
    }
  }, []);

  const cropImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          const sourceWidth = img.width;
          const sourceHeight = img.height;
          const cropWidth = sourceWidth * 0.9;
          const cropHeight = (cropWidth * 200) / (sourceWidth * 0.9);
          const cropX = (sourceWidth - cropWidth) / 2;
          const cropY = (sourceHeight - cropHeight) / 2;

          canvas.width = cropWidth;
          canvas.height = cropHeight;

          ctx.drawImage(
            img,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight
          );

          resolve(canvas.toDataURL('image/jpeg', 1.0));
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for cropping'));
      img.src = imageSrc;
    });
  };

  const processImage = async (imageData: string, mimeType: string) => {
    try {
      setIsProcessingImage(true);
      setError(null);
      logger.info('Processing image data');

      const extractedData = await AnalysisService.getInstance().analyzeImage(imageData, mimeType);
      
      if (Object.keys(extractedData).length === 0) {
        throw new Error('No text could be extracted from the image');
      }
      
      logger.info('Successfully extracted data from image');
      onTextExtracted(extractedData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
      logger.error('Failed to process image', error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsProcessingImage(false);
      setCapturedImage(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        throw new Error(`Image size too large. Please choose an image under ${MAX_FILE_SIZE_MB}MB.`);
      }

      const reader = new FileReader();
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      onImageCapture(imageDataUrl);
      scrollToImageAndProcessing();
      await processImage(imageDataUrl, file.type);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
      setError(errorMessage);
      logger.error('File upload failed:', error);
    }
  };

  const handleTakePhoto = useCallback(async () => {
    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        throw new Error('Failed to capture photo. Please try again.');
      }

      logger.info('Photo captured from camera');
      
      const croppedImage = await cropImage(imageSrc);
      logger.info('Photo cropped successfully');
      
      setCapturedImage(croppedImage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to capture photo';
      setError(errorMessage);
      logger.error('Camera capture failed:', error);
    }
  }, [webcamRef]);

  const handleConfirmPhoto = async () => {
    if (!capturedImage) return;
    
    try {
      onImageCapture(capturedImage);
      setShowCamera(false);
      scrollToImageAndProcessing();
      await processImage(capturedImage, 'image/jpeg');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process photo';
      setError(errorMessage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
    setCapturedImage(null);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4">
        <label
          htmlFor="file-upload"
          className="w-full sm:w-auto cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline text-sm sm:text-base text-center">
          <Upload className="inline-block mr-2" size={16} />
          Upload File
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <button
          onClick={() => setShowCamera(true)}
          className="w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline text-sm sm:text-base text-center">
          <Camera className="inline-block mr-2" size={16} />
          Take Photo
        </button>
      </div>

      {showCamera && (
        <CameraOverlay
          webcamRef={webcamRef}
          capturedImage={capturedImage}
          isProcessingImage={isProcessingImage}
          onClose={handleCloseCamera}
          onTakePhoto={handleTakePhoto}
          onConfirmPhoto={handleConfirmPhoto}
          onRetake={handleRetake}
        />
      )}

      {error && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center text-sm w-full">
          <AlertCircle className="mr-2 flex-shrink-0" size={16} />
          <span className="flex-grow">{error}</span>
        </div>
      )}

      {imageData && (
        <div ref={imageContainerRef} className="mt-4 w-full">
          <img 
            src={imageData} 
            alt="Image Preview" 
            className="w-full max-w-md mx-auto rounded-lg shadow-sm" 
          />
        </div>
      )}

      {isProcessingImage && !showCamera && (
        <div ref={processingRef} className="mt-4 w-full flex justify-center">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm">
            <Loader2 className="animate-spin" size={16} />
            <span>Processing image...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;