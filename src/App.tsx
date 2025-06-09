import React, { useState, useRef, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import InspectionForm from './components/InspectionForm';
import PDFPreview from './components/PDFPreview';
import SendToOfficeModal from './components/SendToOfficeModal';
import SettingsModal from './components/SettingsModal';
import { PDFGenerator } from './utils/pdf/pdfGenerator';
import { EmailService } from './services/email.service';
import { FileDown, ClipboardCheck, RotateCcw, AlertCircle, Settings } from 'lucide-react';
import { logger } from './utils/logger';
import type { InspectionFormData } from './types/inspection';
import type { PDFGeneratorResult } from './types/pdf';

const initialFormData: InspectionFormData = {
  address: '',
  city: '',
  zip: '',
  deviceType: '',
  deviceSize: '',
  serialNumber: '',
  test1A: '',
  test1B: '',
  test3: '',
  notes: '',
  secondTestNF: false
};

function App() {
  const [formData, setFormData] = useState<InspectionFormData>(initialFormData);
  const [imageData, setImageData] = useState<string | null>(null);
  const [pdfUrls, setPdfUrls] = useState<PDFGeneratorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSendToOfficeModal, setShowSendToOfficeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isProcessingEmail, setIsProcessingEmail] = useState(false);
  const pdfPreviewRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const pdfGenerator = PDFGenerator.getInstance();
  const emailService = EmailService.getInstance();

  useEffect(() => {
    return () => {
      if (pdfUrls) {
        pdfGenerator.cleanup(pdfUrls);
      }
    };
  }, [pdfUrls]);

  const handleFormChange = (data: Partial<InspectionFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleImageCapture = (data: string) => {
    setImageData(data);
  };

  const handleTextExtracted = (data: Partial<InspectionFormData>) => {
    logger.info('Updating form with extracted text data');
    setFormData(prev => ({ ...prev, ...data }));

    if (window.innerWidth <= 768 && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGenerateReport = async () => {
    try {
      setError(null);

      if (pdfUrls) {
        pdfGenerator.cleanup(pdfUrls);
      }

      const urls = await pdfGenerator.generatePDF(formData);
      setPdfUrls(urls);

      // Wait for state update and PDF rendering
      setTimeout(() => {
        if (pdfPreviewRef.current) {
          pdfPreviewRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate PDF';
      setError(message);
      logger.error('Failed to generate PDF report:', error);
    }
  };

  const handleSendToOffice = () => {
    logger.info('Send to Office button clicked');
    setShowSendToOfficeModal(true);
  };

  const handleSendToOfficeModalClose = () => {
    setShowSendToOfficeModal(false);
  };

  const handleSendToOfficeConfirm = async (recipient: string, recipientName: string) => {
    try {
      setIsProcessingEmail(true);
      setError(null);
      logger.info('Send to Office confirmed', { recipient, recipientName });

      if (!pdfUrls?.downloadUrl) {
        throw new Error('PDF not available. Please generate the report first.');
      }

      // Fetch the PDF blob from the download URL
      const response = await fetch(pdfUrls.downloadUrl);
      const pdfBlob = await response.blob();

      // Validate email for 'other' recipient
      if (recipient === 'other' && !emailService.validateEmail(recipientName)) {
        throw new Error('Please enter a valid email address for the custom recipient.');
      }

      await emailService.composeEmail({
        recipient,
        recipientName,
        address: formData.address || 'Unknown Address',
        pdfBlob
      });

      setShowSendToOfficeModal(false);
      logger.info('Email composition completed successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to compose email';
      setError(message);
      logger.error('Failed to compose email:', error);
    } finally {
      setIsProcessingEmail(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setImageData(null);
    setError(null);
    setShowSendToOfficeModal(false);
    setShowSettingsModal(false);
    if (pdfUrls) {
      pdfGenerator.cleanup(pdfUrls);
      setPdfUrls(null);
    }
    logger.info('Reset all form data and image');

    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isFormEmpty = Object.values(formData).every(value => value === '' || value === false);
  const hasData = !isFormEmpty || imageData !== null;

  return (
    <div className="min-h-screen bg-gray-50" role="main" aria-label="Backflow Inspection Report Application">
      <div ref={topRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Header with Settings */}
        <div className="flex justify-between items-start mb-8 sm:mb-12">
          <div className="text-center flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Backflow Inspection Report
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">
              Upload an image or take a photo of your backflow preventer test results to automatically extract inspection data
            </p>
          </div>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="ml-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Settings"
          >
            <Settings size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center space-x-2 mb-2 sm:mb-4">
                <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Image Upload</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Upload or capture an image of your backflow preventer test results for automatic data extraction
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <ImageUpload 
                onImageCapture={handleImageCapture}
                onTextExtracted={handleTextExtracted}
                imageData={imageData}
              />
            </div>
          </div>

          <div ref={formRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center space-x-2 mb-2 sm:mb-4">
                <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Inspection Details</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Review and edit the extracted inspection data
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <InspectionForm
                formData={formData}
                onChange={handleFormChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          {!isFormEmpty && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200 max-w-2xl w-full">
              <AlertCircle className="flex-shrink-0\" size={20} />
              <p className="text-sm">
                Please verify all information in the form is correct before generating the report
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={handleGenerateReport}
              disabled={isFormEmpty}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm sm:text-base"
            >
              <FileDown className="mr-2" size={20} />
              Generate Report
            </button>

            {hasData && (
              <button
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-sm text-sm sm:text-base"
              >
                <RotateCcw className="mr-2" size={20} />
                Reset All
              </button>
            )}
          </div>
          {isFormEmpty && (
            <p className="text-xs sm:text-sm text-gray-500 text-center px-4">
              Please fill in some inspection details before generating a report
            </p>
          )}
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 px-4">
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        <div ref={pdfPreviewRef}>
          <PDFPreview 
            previewUrl={pdfUrls?.previewUrl ?? null}
            downloadUrl={pdfUrls?.downloadUrl ?? null}
            onReset={handleReset}
            onSendToOffice={handleSendToOffice}
            address={formData.address}
          />
        </div>
      </div>

      <SendToOfficeModal
        isOpen={showSendToOfficeModal}
        onClose={handleSendToOfficeModalClose}
        onSend={handleSendToOfficeConfirm}
        address={formData.address}
        isProcessing={isProcessingEmail}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}

export default App;