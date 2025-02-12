import React from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFPreviewProps {
  previewUrl: string | null;
  downloadUrl: string | null;
  onReset: () => void;
  address?: string;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ previewUrl, downloadUrl, onReset, address }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],
    toolbarPlugin: {
      fullScreenPlugin: {
        onEnterFullScreen: (zoom) => {
          return zoom;
        },
        onExitFullScreen: (zoom) => {
          return zoom;
        },
      },
    },
  });

  const getFileName = () => {
    const date = new Date().toISOString().split('T')[0];
    const cleanAddress = address ? 
      address.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').toLowerCase() :
      'backflow-inspection';
    return `${cleanAddress}-${date}.pdf`;
  };

  if (!previewUrl) return null;

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Preview Report</h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Review your inspection report before downloading
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="h-[500px] sm:h-[1000px] border rounded-lg overflow-hidden">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer
                fileUrl={previewUrl}
                plugins={[defaultLayoutPluginInstance]}
                defaultScale={SpecialZoomLevel.PageFit}
                initialPage={0}
              />
            </Worker>
          </div>
          
          {downloadUrl && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center sm:justify-end gap-4">
              <a
                href={downloadUrl}
                download={getFileName()}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm sm:text-base"
              >
                <Download className="mr-2" size={20} />
                Download Report
              </a>
              <button
                onClick={onReset}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-sm text-sm sm:text-base"
              >
                <RotateCcw className="mr-2" size={20} />
                Reset All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;