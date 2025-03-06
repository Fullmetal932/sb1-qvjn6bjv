
import { logger } from '../utils/logger';
import type { InspectionFormData } from '../types/inspection';

export interface EditEvent {
  fieldName: string;
  originalValue: string;
  newValue: string;
  timestamp: number;
}

export class EditTrackingService {
  private static instance: EditTrackingService;
  private edits: Record<string, EditEvent[]> = {};
  private sessionId: string;
  private initialValues: Partial<InspectionFormData> = {};
  private isTracking = false;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): EditTrackingService {
    if (!EditTrackingService.instance) {
      EditTrackingService.instance = new EditTrackingService();
    }
    return EditTrackingService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  public startTracking(initialData: Partial<InspectionFormData>): void {
    this.initialValues = { ...initialData };
    this.isTracking = true;
    this.edits[this.sessionId] = [];
    logger.info('Started edit tracking', { sessionId: this.sessionId });
  }

  public trackEdit(fieldName: keyof InspectionFormData, newValue: string): void {
    if (!this.isTracking) return;
    
    const originalValue = this.initialValues[fieldName]?.toString() || '';
    
    if (originalValue === newValue) return;
    
    const editEvent: EditEvent = {
      fieldName: fieldName.toString(),
      originalValue,
      newValue,
      timestamp: Date.now()
    };
    
    this.edits[this.sessionId].push(editEvent);
    logger.info('Tracked edit event', { 
      sessionId: this.sessionId, 
      fieldName, 
      originalValue, 
      newValue 
    });
  }

  public stopTracking(): EditEvent[] {
    this.isTracking = false;
    const sessionEdits = [...this.edits[this.sessionId]];
    
    // Upload to server or store in localStorage
    this.saveEdits(sessionEdits);
    
    logger.info('Stopped edit tracking', { 
      sessionId: this.sessionId, 
      editCount: sessionEdits.length 
    });
    
    return sessionEdits;
  }

  private saveEdits(edits: EditEvent[]): void {
    // Store in localStorage for now
    try {
      const existingEdits = JSON.parse(localStorage.getItem('aiEditTracking') || '[]');
      const updatedEdits = [...existingEdits, {
        sessionId: this.sessionId,
        timestamp: Date.now(),
        edits
      }];
      localStorage.setItem('aiEditTracking', JSON.stringify(updatedEdits));
    } catch (error) {
      logger.error('Failed to save edit tracking data', { error });
    }
  }

  public getAllEdits(): Record<string, EditEvent[]> {
    // In a real implementation, this would fetch from server
    try {
      const storedEdits = localStorage.getItem('aiEditTracking');
      if (storedEdits) {
        const parsed = JSON.parse(storedEdits);
        return parsed.reduce((acc: Record<string, EditEvent[]>, item: any) => {
          acc[item.sessionId] = item.edits;
          return acc;
        }, {});
      }
    } catch (error) {
      logger.error('Failed to retrieve edit tracking data', { error });
    }
    return {};
  }

  public getStatistics() {
    const allEdits = this.getAllEdits();
    const sessions = Object.keys(allEdits);
    
    const stats = {
      totalSessions: sessions.length,
      totalEdits: 0,
      editsByField: {} as Record<string, number>,
      sessionsWithEdits: 0
    };
    
    sessions.forEach(sessionId => {
      const sessionEdits = allEdits[sessionId];
      stats.totalEdits += sessionEdits.length;
      
      if (sessionEdits.length > 0) {
        stats.sessionsWithEdits++;
      }
      
      sessionEdits.forEach(edit => {
        stats.editsByField[edit.fieldName] = (stats.editsByField[edit.fieldName] || 0) + 1;
      });
    });
    
    return stats;
  }
}
