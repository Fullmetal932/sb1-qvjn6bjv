import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { logger } from './utils/logger';
import { ClipboardCheck, FileText, CheckSquare, BarChart } from 'lucide-react';
import { PDFGenerator, PDFGeneratorResult } from './utils/pdf/pdfGenerator';
import { InspectionFormData } from './types/inspection';
import ImageUpload from './components/ImageUpload';
import InspectionForm from './components/InspectionForm';
import PDFPreview from './components/PDFPreview';
import AdminDashboard from './components/AdminDashboard';
import { InspectionProvider, useInspection } from './contexts/InspectionContext';
import { EditTrackingService } from './services/edit-tracking.service';

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

function AppContent() {
  const { formData, updateFormData, setInitialAIData } = useInspection();
  const [imageData, setImageData] = useState<string | null>(null);
  const [pdfUrls, setPdfUrls] = useState<PDFGeneratorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);
  const pdfPreviewRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const pdfGenerator = PDFGenerator.getInstance();
  const editTracker = EditTrackingService.getInstance();

  useEffect(() => {
    return () => {
      if (pdfUrls) {
        pdfGenerator.cleanup(pdfUrls);
      }
    };
  }, [pdfUrls]);

  const handleFormChange = (data: Partial<InspectionFormData>) => {
    updateFormData(data);
  };

  const handleImageCapture = (data: string) => {
    setImageData(data);
  };

  const handleTextExtracted = (data: Partial<InspectionFormData>) => {
    logger.info('Updating form with extracted text data');
    setInitialAIData(data);

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

      // Stop tracking edits and get statistics
      editTracker.stopTracking();

      const urls = await pdfGenerator.generatePDF(formData);
      setPdfUrls(urls);

      if (pdfPreviewRef.current) {
        pdfPreviewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (error) {
      logger.error('Failed to generate PDF', { error });
      setError('Failed to generate PDF. Please try again.');

      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleClearForm = () => {
    updateFormData(initialFormData);
    setImageData(null);
    setPdfUrls(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div ref={topRef} className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 sm:mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Backflow Test Report</h1>
            <p className="text-gray-600 text-sm sm:text-base">Fill out the form manually or upload an image of your test results</p>
          </div>
          <button
            onClick={() => setShowAdminDashboard(!showAdminDashboard)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            <BarChart className="h-4 w-4" />
            {showAdminDashboard ? 'Back to Form' : 'Admin Dashboard'}
          </button>
        </header>

        {showAdminDashboard ? (
          <AdminDashboard />
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

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
                    <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Inspection Form</h2>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Review and edit the extracted data, or manually fill out the form
                  </p>
                </div>
                <div className="p-4 sm:p-6">
                  <InspectionForm 
                    formData={formData}
                    onChange={handleFormChange}
                  />

                  <div className="mt-6 flex flex-wrap gap-4">
                    <button
                      onClick={handleGenerateReport}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      type="button"
                    >
                      Generate Report
                    </button>
                    <button
                      onClick={handleClearForm}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      type="button"
                    >
                      Clear Form
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {pdfUrls && (
              <div ref={pdfPreviewRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 sm:mb-12">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-2 mb-2 sm:mb-4">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Report Preview</h2>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Preview and download your generated report
                  </p>
                </div>
                <div className="p-4 sm:p-6">
                  <PDFPreview pdfUrls={pdfUrls} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}

function App() {
  return (
    <InspectionProvider>
      <AppContent />
    </InspectionProvider>
  );
}

export default App;