
export interface InspectionFormData {
  address: string;
  city: string;
  zip: string;
  deviceType: string;
  deviceSize: string;
  serialNumber: string;
  test1A: string;
  test1B: string;
  test3: string;
  notes: string;
  secondTestNF: boolean;
}

export type InspectionFormField = keyof InspectionFormData;

export interface ValidationError {
  field: InspectionFormField;
  message: string;
}

export interface ProcessedImageData {
  base64Data: string;
  mimeType: string;
  extractedData: Partial<InspectionFormData>;
}
