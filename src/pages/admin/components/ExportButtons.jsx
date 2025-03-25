import React from 'react';
import html2pdf from 'html2pdf.js';

const ExportButtons = ({ data }) => {
  const exportCSV = () => {
    try {
      // Generate CSV content
      const headers = [
        'Date',
        'LDAP',
        'Quiz Type',
        'Score',
        'Supervisor',
        'Market',
        'Time Taken'
      ];

      const csvContent = [
        headers.join(','),
        ...data.map(item => {
          const date = new Date(item.date_of_test).toLocaleDateString();
          const timeTaken = `${Math.floor(item.time_taken / 60)}:${(item.time_taken % 60).toString().padStart(2, '0')}`;
          return [
            `"${date}"`,
            `"${item.ldap}"`,
            `"${item.quiz_type}"`,
            `"${item.score_text}"`,
            `"${item.supervisor}"`,
            `"${item.market}"`,
            `"${timeTaken}"`
          ].join(',');
        })
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'quiz_results.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const exportPDF = async () => {
    try {
      // Create a temporary div for PDF content
      const element = document.createElement('div');
      element.style.padding = '20px';

      // Add title
      const title = document.createElement('h1');
      title.style.fontSize = '24px';
      title.style.marginBottom = '20px';
      title.textContent = 'Quiz Results Report';
      element.appendChild(title);

      // Add date range if available
      const dateRange = document.createElement('p');
      dateRange.style.marginBottom = '20px';
      dateRange.textContent = `Generated on: ${new Date().toLocaleDateString()}`;
      element.appendChild(dateRange);

      // Create table
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '20px';

      // Add headers
      const headers = ['Date', 'LDAP', 'Quiz Type', 'Score', 'Supervisor', 'Market', 'Time'];
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headers.forEach(header => {
        const th = document.createElement('th');
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f4f4f4';
        th.textContent = header;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Add data rows
      const tbody = document.createElement('tbody');
      data.forEach(item => {
        const row = document.createElement('tr');
        const date = new Date(item.date_of_test).toLocaleDateString();
        const timeTaken = `${Math.floor(item.time_taken / 60)}:${(item.time_taken % 60).toString().padStart(2, '0')}`;
        
        [date, item.ldap, item.quiz_type, item.score_text, item.supervisor, item.market, timeTaken]
          .forEach(text => {
            const td = document.createElement('td');
            td.style.border = '1px solid #ddd';
            td.style.padding = '8px';
            td.textContent = text;
            row.appendChild(td);
          });
        
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      element.appendChild(table);

      // Configure PDF options
      const opt = {
        margin: 1,
        filename: 'quiz_results.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };

      // Generate PDF
      await html2pdf().set(opt).from(element).save();

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <div className="flex gap-4 mb-4">
      <button
        onClick={exportCSV}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export CSV
      </button>
      <button
        onClick={exportPDF}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export PDF
      </button>
    </div>
  );
};

export default ExportButtons;
