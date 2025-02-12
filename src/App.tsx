import React from 'react';
import { InspectionProvider } from './contexts/InspectionContext';
import { InspectionForm } from './components/InspectionForm';
import { ImageUpload } from './components/ImageUpload';
import { PDFPreview } from './components/PDFPreview';


export default function App() {
  return (
    <InspectionProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="enterprise-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white py-6">
              Backflow Inspection Report
            </h1>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <ImageUpload />
            <InspectionForm />
            <PDFPreview />
          </div>
        </main>
      </div>
    </InspectionProvider>
  );
}