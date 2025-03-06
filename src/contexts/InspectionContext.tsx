
import React, { createContext, useContext, useState, useCallback } from 'react';
import { InspectionFormData } from '../types/inspection';
import { EditTrackingService } from '../services/edit-tracking.service';

interface InspectionContextType {
  formData: InspectionFormData;
  updateFormData: (data: Partial<InspectionFormData>) => void;
  updateField: (fieldName: keyof InspectionFormData, value: string | boolean) => void;
  resetForm: () => void;
  setInitialAIData: (data: Partial<InspectionFormData>) => void;
}

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

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

export const InspectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<InspectionFormData>(initialFormData);
  const editTracker = EditTrackingService.getInstance();

  const updateFormData = useCallback((data: Partial<InspectionFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const updateField = useCallback((fieldName: keyof InspectionFormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [fieldName]: value };
      
      // Track the edit if it's a string value
      if (typeof value === 'string') {
        editTracker.trackEdit(fieldName, value);
      }
      
      return newData;
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const setInitialAIData = useCallback((data: Partial<InspectionFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Start tracking edits with the initial AI-extracted data
    editTracker.startTracking(data);
  }, []);

  return (
    <InspectionContext.Provider value={{ formData, updateFormData, updateField, resetForm, setInitialAIData }}>
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspection = (): InspectionContextType => {
  const context = useContext(InspectionContext);
  if (context === undefined) {
    throw new Error('useInspection must be used within an InspectionProvider');
  }
  return context;
};
