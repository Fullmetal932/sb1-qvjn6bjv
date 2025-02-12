// src/services/file-manager.service.ts
import { logger } from "../utils/logger";

export class GoogleAIFileManager {
  private static instance: GoogleAIFileManager | null = null;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): GoogleAIFileManager {
    if (!GoogleAIFileManager.instance) {
      GoogleAIFileManager.instance = new GoogleAIFileManager();
    }
    return GoogleAIFileManager.instance;
  }

  public async uploadFile(file: File): Promise<{ uri: string; mimeType: string }> {
    try {
      logger.info('Starting file upload', { fileName: file.name, type: file.type });
      
      // Convert file to base64 string
      const reader = new FileReader();
      const fileDataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fileData = await fileDataPromise;
      logger.info('File converted to data URL');

      return { 
        uri: fileData,
        mimeType: file.type 
      };
    } catch (error) {
      logger.error('Failed to upload file', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
  
  public revokeUri(fileUri: string): void {
    try {
      logger.info('Revoking file URI', { uri: fileUri });
      URL.revokeObjectURL(fileUri);
      logger.info('File URI successfully revoked', { uri: fileUri });
    } catch(error) {
      logger.error('Failed to revoke file URI', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
}