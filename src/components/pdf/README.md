# Professional PDF Generation System

This directory contains the new enterprise-level PDF generation system using React-PDF, replacing the legacy html2pdf.js implementation.

## Overview

The new system provides:
- **Professional Quality**: Vector-based PDFs with selectable text
- **Enterprise Features**: Headers, footers, page numbers, branding
- **Performance**: Fast generation, small file sizes
- **Maintainability**: React-like component syntax
- **Consistency**: Standardized layouts and styling

## Components

### Core Components

#### `QuizReportPDF.jsx`
Main PDF document component that orchestrates the entire report layout.
- Handles pagination and page breaks
- Manages font loading and document metadata
- Coordinates all sub-components

#### `QuizHeader.jsx`
Professional header section with:
- Company branding and logo
- Quiz title and description
- Student information and completion details
- Formatted date and time

#### `QuizScoreSection.jsx`
Comprehensive score display featuring:
- Pass/fail status with color coding
- Score breakdown (correct/total/percentage)
- Performance visualization bar
- Summary text with personalized feedback

#### `QuizQuestionSection.jsx`
Detailed question review with:
- Question-by-question breakdown
- User answers vs correct answers
- Color-coded feedback (green for correct, red for incorrect)
- Explanations when available

#### `QuizFooter.jsx`
Professional footer with:
- Page numbers
- Generation date
- Confidentiality notice
- Company branding

### Utility Components

#### `PDFTestButton.jsx`
Development utility for testing PDF generation with sample data.

## Services

### `pdfService.js`
Main service class providing:

#### Methods
- `generateQuizReportPDF(options)` - Generate PDF blob
- `downloadQuizReportPDF(options, filename)` - Generate and download PDF
- `generateQuizReportPDFBase64(options)` - Generate base64 encoded PDF
- `uploadQuizResultsPDF(options, accessCodeData)` - Generate and upload to Supabase

#### Options Object
```javascript
{
  quiz: Object,           // Quiz data with questions
  selectedAnswers: Object, // User's selected answers
  score: Object,          // Score with correct, total, percentage
  timeTaken: Number,      // Time taken in seconds
  ldap: String,           // Student ID/LDAP
  isPractice: Boolean,    // Whether this is a practice quiz
  accessCodeData: Object, // Access code data (optional)
  companyLogo: String     // Company logo URL (optional)
}
```

## Usage Examples

### Basic PDF Download
```javascript
import { pdfService } from '../../services/pdfService';

const handleDownloadPDF = async () => {
  try {
    await pdfService.downloadQuizReportPDF({
      quiz,
      selectedAnswers,
      score,
      timeTaken,
      ldap: 'student123',
      isPractice: false
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
  }
};
```

### Generate PDF for Upload
```javascript
const handleUploadPDF = async () => {
  try {
    const pdfUrl = await pdfService.uploadQuizResultsPDF({
      quiz,
      selectedAnswers,
      score,
      timeTaken,
      ldap: 'student123',
      isPractice: false,
      accessCodeData
    }, accessCodeData);
    
    console.log('PDF uploaded:', pdfUrl);
  } catch (error) {
    console.error('PDF upload failed:', error);
  }
};
```

## Migration from html2pdf.js

### Before (Legacy)
```javascript
import html2pdf from 'html2pdf.js';
import { buildPdfContentHtml } from '../../utils/pdfGenerator';

const pdfContent = buildPdfContentHtml(quiz, selectedAnswers, score, timeTaken, ldap, isPractice);
html2pdf().set(options).from(pdfContent).save();
```

### After (React-PDF)
```javascript
import { pdfService } from '../../services/pdfService';

await pdfService.downloadQuizReportPDF({
  quiz, selectedAnswers, score, timeTaken, ldap, isPractice
});
```

## Benefits Over html2pdf.js

| Feature | html2pdf.js | React-PDF |
|---------|-------------|-----------|
| Output Quality | Rasterized images | Vector-based |
| File Size | Large (images) | Small (vectors) |
| Text Selection | No | Yes |
| Page Breaks | Limited control | Full control |
| Performance | Slow | Fast |
| Styling | CSS limitations | Full control |
| Maintenance | Complex HTML/CSS | React components |

## Styling

The PDF components use React-PDF's StyleSheet API, similar to React Native:

```javascript
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 10,
  }
});
```

## Fonts

The system uses Inter font family with multiple weights:
- 400 (Regular)
- 600 (Semi-bold)
- 700 (Bold)

Fonts are loaded from Google Fonts CDN for consistent typography.

## Testing

Use the `PDFTestButton` component to test PDF generation:

```javascript
import { PDFTestButton } from '../components/pdf';

// Add to any page for testing
<PDFTestButton />
```

## Troubleshooting

### Common Issues

1. **Font loading errors**: Check network connectivity to Google Fonts
2. **Large file sizes**: Ensure images are optimized
3. **Layout issues**: Verify StyleSheet syntax and React-PDF limitations

### Debug Mode

Enable debug logging:
```javascript
console.log('PDF generation options:', options);
```

## Future Enhancements

- Custom branding themes
- Multiple language support
- Advanced chart integration
- Batch PDF generation
- Email integration
