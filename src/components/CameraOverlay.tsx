import React from 'react';
import { X, Loader2, RotateCcw } from 'lucide-react';
import Webcam from 'react-webcam';

interface CameraOverlayProps {
  webcamRef: React.RefObject<Webcam>;
  capturedImage: string | null;
  isProcessingImage: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onConfirmPhoto: () => void;
  onRetake: () => void;
}

const CameraOverlay: React.FC<CameraOverlayProps> = ({
  webcamRef,
  capturedImage,
  isProcessingImage,
  onClose,
  onTakePhoto,
  onConfirmPhoto,
  onRetake,
}) => {
  return (
    <div className="fixed inset-0 z-50">
      <div className="relative h-full bg-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors duration-200"
          disabled={isProcessingImage}
        >
          <X size={24} />
        </button>

        {!capturedImage ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            className="h-full w-full object-cover"
            videoConstraints={{
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-black">
            <img 
              src={capturedImage} 
              alt="Captured"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}

        {!capturedImage && (
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 right-0 h-[calc(50%-100px)] bg-black bg-opacity-50" />
            <div className="absolute top-[calc(50%-100px)] left-0 w-[5%] h-[200px] bg-black bg-opacity-50" />
            <div className="absolute top-[calc(50%-100px)] right-0 w-[5%] h-[200px] bg-black bg-opacity-50" />
            <div className="absolute bottom-0 left-0 right-0 h-[calc(50%-100px)] bg-black bg-opacity-50" />

            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[500px] h-[200px]">
              <div className="absolute inset-0 border-2 border-white rounded-lg"></div>
              <div className="absolute -left-1 -top-1 w-5 h-5 border-l-4 border-t-4 border-white"></div>
              <div className="absolute -right-1 -top-1 w-5 h-5 border-r-4 border-t-4 border-white"></div>
              <div className="absolute -left-1 -bottom-1 w-5 h-5 border-l-4 border-b-4 border-white"></div>
              <div className="absolute -right-1 -bottom-1 w-5 h-5 border-r-4 border-b-4 border-white"></div>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-32 text-white text-center">
              <p className="text-lg font-medium mb-2">Position the form within the frame</p>
              <p className="text-sm opacity-80">Make sure the text is clear and well-lit</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
          {!capturedImage ? (
            <button
              onClick={onTakePhoto}
              disabled={isProcessingImage}
              className="bg-white text-black w-20 h-20 rounded-full flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingImage ? (
                <Loader2 className="animate-spin" size={32} />
              ) : (
                <div className="w-16 h-16 rounded-full border-4 border-black" />
              )}
            </button>
          ) : (
            <div className="flex items-center gap-6">
              <button
                onClick={onConfirmPhoto}
                disabled={isProcessingImage}
                className="bg-green-500 text-white w-20 h-20 rounded-full flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
              >
                {isProcessingImage ? (
                  <Loader2 className="animate-spin" size={32} />
                ) : (
                  <div className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center">
                    ✓
                  </div>
                )}
              </button>

              <button
                onClick={onRetake}
                disabled={isProcessingImage}
                className="bg-gray-800 text-white w-16 h-16 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
              >
                <RotateCcw size={24} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraOverlay;