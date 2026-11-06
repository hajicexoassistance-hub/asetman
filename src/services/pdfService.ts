import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BeritaAcaraDoc, SesiSO, AssetLoan, Asset } from '../types';
import { formatDateIndonesian, formatRupiah } from '../utils/dateUtils';

/**
 * Generates and downloads a professional PDF document for Berita Acara, Stock Opname Report, or Loan Slip.
 */
export async function generateAndDownloadPdf(
  title: string,
  elementId: string,
  filename: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemen dokumen PDF tidak ditemukan.');
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error('Gagal menghasilkan PDF:', err);
    throw new Error('Gagal menghasilkan file PDF.');
  }
}

/**
 * Opens browser print dialog for the selected document element.
 */
export function printDocument(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Cetak Dokumen - Assets Management</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #2C3E50; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 12px; }
          th { background-color: #f1f5f9; }
          .no-print { display: none; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
