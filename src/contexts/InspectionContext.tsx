
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { InspectionFormData } from '../types/inspection';

interface State {
  formData: Partial<InspectionFormData>;
  imageData: string | null;
  isProcessing: boolean;
  errors: Record<string, string>;
}

type Action =
  | { type: 'SET_FORM_DATA'; payload: Partial<InspectionFormData> }
  | { type: 'SET_IMAGE_DATA'; payload: string | null }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Record<string, string> };

const initialState: State = {
  formData: {},
  imageData: null,
  isProcessing: false,
  errors: {},
};

const InspectionContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function InspectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer((state: State, action: Action): State => {
    switch (action.type) {
      case 'SET_FORM_DATA':
        return { ...state, formData: { ...state.formData, ...action.payload } };
      case 'SET_IMAGE_DATA':
        return { ...state, imageData: action.payload };
      case 'SET_PROCESSING':
        return { ...state, isProcessing: action.payload };
      case 'SET_ERRORS':
        return { ...state, errors: action.payload };
      default:
        return state;
    }
  }, initialState);

  return (
    <InspectionContext.Provider value={{ state, dispatch }}>
      {children}
    </InspectionContext.Provider>
  );
}

export const useInspection = () => {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspection must be used within InspectionProvider');
  }
  return context;
};
