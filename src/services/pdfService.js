import { pdf } from '@react-pdf/renderer';
import QuizReportPDF from '../components/pdf/QuizReportPDF';

/**
 * Professional PDF generation service using React-PDF
 * Replaces the legacy html2pdf.js implementation with enterprise-level PDF generation
 */
class PDFService {
  /**
   * Generate a quiz results PDF using React-PDF
   * @param {Object} options - PDF generation options
   * @param {Object} options.quiz - Quiz data
   * @param {Object} options.selectedAnswers - User's selected answers
   * @param {Object} options.score - Score object with correct, total, percentage
   * @param {number} options.timeTaken - Time taken in seconds
   * @param {string} options.ldap - Student LDAP/ID
   * @param {boolean} options.isPractice - Whether this is a practice quiz
   * @param {Object} options.accessCodeData - Access code data (optional)
   * @param {string} options.companyLogo - Company logo URL (optional)
   * @returns {Promise<Blob>} PDF blob
   */
  async generateQuizReportPDF({
    quiz,
    selectedAnswers,
    score,
    timeTaken,
    ldap,
    isPractice = false,
    accessCodeData = null,
    companyLogo = null
  }) {
    try {
      console.log('Generating PDF with React-PDF...');
      
      // Create the PDF document
      const pdfDocument = QuizReportPDF({
        quiz,
        selectedAnswers,
        score,
        timeTaken,
        ldap,
        isPractice,
        accessCodeData,
        companyLogo
      });

      // Generate the PDF blob
      const blob = await pdf(pdfDocument).toBlob();
      
      console.log('PDF generated successfully, size:', blob.size);
      return blob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Generate and download a quiz results PDF
   * @param {Object} options - Same as generateQuizReportPDF
   * @param {string} filename - Optional filename (will be auto-generated if not provided)
   */
  async downloadQuizReportPDF(options, filename = null) {
    try {
      const blob = await this.generateQuizReportPDF(options);
      
      // Generate filename if not provided
      if (!filename) {
        const timestamp = new Date().toISOString().split('.')[0].replace(/[:]/g, '-');
        filename = `${options.ldap}-quiz-results-${timestamp}.pdf`;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('PDF downloaded successfully:', filename);
      return blob;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }

  /**
   * Generate PDF and convert to base64 for upload
   * @param {Object} options - Same as generateQuizReportPDF
   * @returns {Promise<string>} Base64 encoded PDF data
   */
  async generateQuizReportPDFBase64(options) {
    try {
      const blob = await this.generateQuizReportPDF(options);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error generating PDF base64:', error);
      throw error;
    }
  }

  /**
   * Upload quiz results PDF to Supabase storage
   * @param {Object} options - PDF generation options
   * @param {Object} accessCodeData - Access code data for validation
   * @returns {Promise<string>} Public URL of uploaded PDF
   */
  async uploadQuizResultsPDF(options, accessCodeData) {
    try {
      console.log('Generating and uploading PDF...');
      
      // Generate PDF as base64
      const base64Data = await this.generateQuizReportPDFBase64(options);
      
      // Call the Edge Function to handle the upload
      const requestBody = {
        pdfData: base64Data,
        accessCode: accessCodeData.code,
        ldap: options.ldap,
        quizId: options.quiz.id
      };

      console.log('Sending request to Edge Function...');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-quiz-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge Function error response:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('PDF uploaded successfully:', result.pdf_url);
      
      return result.pdf_url;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use generateQuizReportPDF instead
   */
  async generatePDF(quiz, selectedAnswers, score, timeTaken, ldap, isPractice = false) {
    console.warn('generatePDF is deprecated. Use generateQuizReportPDF instead.');
    return this.generateQuizReportPDF({
      quiz,
      selectedAnswers,
      score,
      timeTaken,
      ldap,
      isPractice
    });
  }
}

// Export singleton instance
export const pdfService = new PDFService();
export default pdfService;
