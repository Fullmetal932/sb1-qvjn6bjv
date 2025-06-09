import { logger } from '../utils/logger';
import type { InspectionFormData } from '../types/inspection';

export interface EmailData {
  recipient: string;
  recipientName: string;
  address: string;
  pdfBlob: Blob;
}

export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private getDefaultOfficeEmail(): string {
    const defaultEmail = localStorage.getItem('bfir_defaultOfficeEmail');
    return defaultEmail || 'office@supremesprinklers.com';
  }

  public setDefaultOfficeEmail(email: string): void {
    localStorage.setItem('bfir_defaultOfficeEmail', email);
    logger.info('Default office email updated', { email });
  }

  private generateSubject(recipientName: string): string {
    return `Backflow Certificate — ${recipientName}`;
  }

  private generateEmailBody(address: string, recipientName: string): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `Dear ${recipientName},

Please find attached the completed Backflow Prevention Device Inspection Report for the property located at:

${address}

Inspection Date: ${currentDate}

This report has been generated using our digital inspection system and contains all required test results and certification information.

If you have any questions regarding this inspection report, please don't hesitate to contact us.

Best regards,
Supreme Sprinklers Inspection Team

---
This email was generated automatically by the Backflow Inspection Report System.`;
  }

  public async composeEmail(emailData: EmailData): Promise<void> {
    try {
      logger.info('Composing email', { 
        recipient: emailData.recipient, 
        recipientName: emailData.recipientName 
      });

      const toEmail = emailData.recipient === 'supreme' 
        ? this.getDefaultOfficeEmail()
        : emailData.recipientName; // For 'other', recipientName contains the email

      const subject = this.generateSubject(emailData.recipientName);
      const body = this.generateEmailBody(emailData.address, emailData.recipientName);

      // Check if we can attach files via mailto (limited browser support)
      const canAttachFiles = this.canAttachFilesViaMailto();

      if (canAttachFiles) {
        await this.composeEmailWithAttachment(toEmail, subject, body, emailData.pdfBlob);
      } else {
        await this.composeEmailWithoutAttachment(toEmail, subject, body);
        this.showAttachmentInstructions(emailData.pdfBlob);
      }

    } catch (error) {
      logger.error('Failed to compose email', error);
      throw new Error('Failed to open email client. Please try again.');
    }
  }

  private canAttachFilesViaMailto(): boolean {
    // Most browsers don't support file attachments via mailto
    // We'll implement a fallback approach
    return false;
  }

  private async composeEmailWithAttachment(
    to: string, 
    subject: string, 
    body: string, 
    pdfBlob: Blob
  ): Promise<void> {
    // This is theoretical - most browsers don't support this
    // Keeping for future enhancement if browser support improves
    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  }

  private async composeEmailWithoutAttachment(
    to: string, 
    subject: string, 
    body: string
  ): Promise<void> {
    const enhancedBody = `${body}

NOTE: Please find the PDF attachment that will be automatically downloaded. Attach this file to your email before sending.`;

    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(enhancedBody)}`;
    
    // Open mailto link
    window.location.href = mailtoUrl;
  }

  private showAttachmentInstructions(pdfBlob: Blob): void {
    // Auto-download the PDF for manual attachment
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backflow-inspection-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show user instructions
    setTimeout(() => {
      alert('Your email client should now be open. The PDF has been downloaded to your device - please attach it to the email before sending.');
    }, 500);
  }

  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}