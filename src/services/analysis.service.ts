import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';
import { ANALYSIS_PROMPT } from '../utils/prompts/analysis.prompt';
import type { InspectionFormData } from '../types/inspection';

export class AnalysisService {
  private static instance: AnalysisService;
  private model: GenerativeModel;

  private constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key is not configured');
    }
    
    const ai = new GoogleGenerativeAI(apiKey);
    this.model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  public static getInstance(): AnalysisService {
    if (!AnalysisService.instance) {
      AnalysisService.instance = new AnalysisService();
    }
    return AnalysisService.instance;
  }

  private cleanJsonText(text: string): string {
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return jsonMatch[1].trim();
    }
    return text.replace(/^```json?\s*|\s*```$/g, '').trim();
  }

  public async analyzeImage(fileUri: string, mimeType: string): Promise<Partial<InspectionFormData>> {
    try {
      logger.info('Starting image analysis');

      if (!fileUri) {
        throw new Error('No file URI provided');
      }

      const base64Data = fileUri.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid file URI format');
      }

      const contents = [{
        role: 'user',
        parts: [
          { text: ANALYSIS_PROMPT },
          { 
            inlineData: {
              mimeType,
              data: base64Data
            }
          }
        ]
      }];

      const result = await this.model.generateContent({
        contents,
        generationConfig: {
          temperature: 0.1,
          topP: 0.1,
          topK: 16,
          maxOutputTokens: 1024,
        },
      });

      const response = await result.response;
      const rawText = response.text();
      
      if (!rawText) {
        logger.error('Empty response from API');
        throw new Error('No text extracted from image');
      }

      const cleanedJson = this.cleanJsonText(rawText);
      
      try {
        const extractedData = JSON.parse(cleanedJson);
        
        if (!extractedData || typeof extractedData !== 'object') {
          throw new Error('Invalid JSON structure');
        }

        const formData: Partial<InspectionFormData> = {
          address: extractedData.address || '',
          city: extractedData.city || '',
          zip: extractedData.zip || '',
          deviceType: extractedData.deviceType || '',
          deviceSize: extractedData.deviceSize || '',
          serialNumber: extractedData.serialNumber || '',
          test1A: extractedData.test1A || '',
          test1B: extractedData.test1B || '',
          test3: extractedData.test3 || '',
          notes: extractedData.notes || '',
          secondTestNF: extractedData.test2?.toUpperCase() === 'NF'
        };

        logger.info('Successfully extracted data', {
          fields: Object.keys(formData).filter(key => !!formData[key as keyof InspectionFormData])
        });

        return formData;
      } catch (error) {
        logger.error('Failed to parse API response', {
          error: error instanceof Error ? error.message : 'Unknown parsing error',
          rawText: rawText.substring(0, 100) + '...'
        });
        throw new Error('Failed to parse extracted text');
      }
    } catch (error) {
      logger.error('Failed to analyze image', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
}