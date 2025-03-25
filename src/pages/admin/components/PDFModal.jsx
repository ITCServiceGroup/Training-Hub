import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create a dedicated storage client with the same credentials as the working Dashboard
const storageClient = createClient(
  "https://scmwpoowjhzawvmiyohz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjbXdwb293amh6YXd2bWl5b2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNTA1NDYsImV4cCI6MjA1MzgyNjU0Nn0.Ul1dRzTe7QQ81lmgTXNZ1QEYtmWDzzUdVP-xPKZXKQI"
);

const PDFModal = ({ isOpen, pdfUrl, onClose }) => {
  console.log('PDFModal render with props:', { isOpen, pdfUrl });
  
  // Skip the modal entirely and just open the PDF directly
  useEffect(() => {
    if (isOpen && pdfUrl) {
      console.log('PDFModal useEffect triggered - getting signed URL');
      
      const getAndOpenPdf = async () => {
        try {
          console.log('Getting signed URL for:', pdfUrl);
          
          // Get the signed URL
          const { data, error } = await storageClient
            .storage
            .from('quiz-pdfs')
            .createSignedUrl(pdfUrl, 3600); // 1-hour expiry

          if (error) {
            console.error('Error getting signed URL:', error);
            alert(`Could not access PDF: ${error.message}`);
            return;
          }

          // Check for both signedUrl and signedURL (API inconsistency)
          const url = data?.signedUrl || data?.signedURL;
          if (!url) {
            console.error('No signed URL in response:', data);
            alert('Failed to generate access link for PDF');
            return;
          }

          console.log('Successfully generated signed URL, opening PDF in new tab');
          
          // Open the PDF in a new tab
          window.open(url, '_blank');
          
          // Close the modal since we're opening the PDF directly
          onClose();
        } catch (err) {
          console.error('Exception getting signed URL:', err);
          alert(`Error: ${err.message || 'Unknown error'}`);
        }
      };
      
      getAndOpenPdf();
    }
  }, [isOpen, pdfUrl, onClose]);

  // We don't need to render anything since we're opening the PDF directly
  return null;
};

export default PDFModal;
