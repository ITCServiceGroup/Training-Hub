import { useEffect } from 'react';
import { supabase } from '../../../config/supabase';

const PDFModal = ({ isOpen, pdfUrl, onClose }) => {
  useEffect(() => {
    if (!isOpen || !pdfUrl) return;

    const getAndOpenPdf = async () => {
      try {
        const objectPath = pdfUrl.includes('/quiz-pdfs/')
          ? pdfUrl.split('/quiz-pdfs/').pop()
          : pdfUrl;
        const { data, error } = await supabase.storage
          .from('quiz-pdfs')
          .createSignedUrl(objectPath, 300);

        if (error) throw error;
        const signedUrl = data?.signedUrl || data?.signedURL;
        if (!signedUrl) throw new Error('No report link was returned');

        window.open(signedUrl, '_blank', 'noopener,noreferrer');
        onClose();
      } catch (error) {
        console.error('Unable to open private quiz report:', error);
        window.alert('This report is unavailable or you do not have permission to view it.');
        onClose();
      }
    };

    void getAndOpenPdf();
  }, [isOpen, pdfUrl, onClose]);

  return null;
};

export default PDFModal;
