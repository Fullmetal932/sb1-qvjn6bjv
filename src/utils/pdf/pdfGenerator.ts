import { PDFDocument } from 'pdf-lib';
import { logger } from '../logger';
import type { InspectionFormData } from '../../types/inspection';
import type { PDFGeneratorResult } from '../../types/pdf';

const TEMPLATE_PATH = '/NEWWA Form V3.pdf';
const CACHE_TIMEOUT = 1000 * 60 * 60; // 1 hour

const FORM_FIELD_MAPPING: Record<string, string> = {
  address: 'Device Address and Location Line 1*',
  city: 'Device Address and Location Line 2 City*',
  zip: 'Device Address and Location Line 2 Zip*',
  serialNumber: 'Serial No.*',
  test1A: 'PVB Check Valve DP PSID*',
  test1B: 'Line Pressure PSI*',
  test3: 'PVB Air Inlet Opened At*',
  notes: 'Notes'
};

export class PDFGenerator {
  private static instance: PDFGenerator;
  private templateCache: {
    buffer: ArrayBuffer;
    timestamp: number;
  } | null = null;

  private constructor() {}

  public static getInstance(): PDFGenerator {
    if (!PDFGenerator.instance) {
      PDFGenerator.instance = new PDFGenerator();
    }
    return PDFGenerator.instance;
  }

  private async loadTemplate(): Promise<ArrayBuffer> {
    // Check if cache is valid
    if (
      this.templateCache &&
      Date.now() - this.templateCache.timestamp < CACHE_TIMEOUT
    ) {
      return this.templateCache.buffer;
    }

    try {
      const response = await fetch(TEMPLATE_PATH);
      if (!response.ok) {
        throw new Error(`Failed to load PDF template: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      this.templateCache = {
        buffer,
        timestamp: Date.now()
      };
      
      return buffer;
    } catch (error) {
      // If cache exists but is expired, use it as fallback
      if (this.templateCache?.buffer) {
        logger.warn('Failed to refresh template, using cached version', error);
        return this.templateCache.buffer;
      }
      throw error;
    }
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  public async generatePDF(formData: InspectionFormData): Promise<PDFGeneratorResult> {
    try {
      const templateBuffer = await this.loadTemplate();
      const pdfDoc = await PDFDocument.load(templateBuffer);
      const form = pdfDoc.getForm();
      
      // Debug: List all available form fields
      const fields = form.getFields();
      logger.info('Available PDF form fields:', fields.map(field => field.getName()));
      
      // Batch all form field operations
      const fieldOperations = Object.entries(FORM_FIELD_MAPPING).map(([key, formFieldName]) => {
        const value = formData[key as keyof InspectionFormData];
        if (value) {
          return () => {
            try {
              const field = form.getTextField(formFieldName);
              if (field) {
                field.setText(value.toString());
              }
            } catch (error) {
              logger.warn(`Error setting field ${formFieldName}:`, error);
            }
          };
        }
        return null;
      }).filter(Boolean) as (() => void)[];

      // Execute all field operations
      fieldOperations.forEach(operation => operation());

      const now = new Date();

      // Add current date and time in a single batch
      const dateTimeOperations = [
        { fieldName: 'Date', value: this.formatDate(now) },
        { fieldName: 'Time', value: this.formatTime(now) }
      ];

      dateTimeOperations.forEach(({ fieldName, value }) => {
        try {
          const field = form.getTextField(fieldName);
          if (field) {
            field.setText(value);
            logger.info(`Successfully set ${fieldName} to: ${value}`);
          } else {
            logger.warn(`Field ${fieldName} not found in PDF form`);
          }
        } catch (error) {
          logger.error(`Error setting ${fieldName} field:`, error);
        }
      });

      // Handle NF checkbox
      if (formData.secondTestNF) {
        try {
          const nfField = form.getCheckBox('Test 2 NF');
          if (nfField) {
            nfField.check();
          }
        } catch (error) {
          logger.warn('Error setting NF checkbox:', error);
        }
      }

      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true // More efficient PDF compression
      });
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      return {
        previewUrl: URL.createObjectURL(blob),
        downloadUrl: URL.createObjectURL(blob)
      };
    } catch (error) {
      logger.error('PDF generation failed:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  public cleanup(urls: PDFGeneratorResult): void {
    try {
      URL.revokeObjectURL(urls.previewUrl);
      URL.revokeObjectURL(urls.downloadUrl);
    } catch (error) {
      logger.error('Error during URL cleanup:', error);
    }
  }
}