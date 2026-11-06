import React, { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { generateAndDownloadPdf, printDocument } from '../services/pdfService';
import { Printer, Download, X, FileText, CheckCircle2 } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  filename: string;
  children: React.ReactNode; // The printable content rendered inside a container with id="pdf-preview-content"
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  filename,
  children,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await generateAndDownloadPdf(title, 'pdf-preview-content', filename);
      setSuccessMsg('PDF berhasil diunduh!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Gagal mengunduh PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    printDocument('pdf-preview-content');
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxHeightClass="max-h-[96vh]"
    >
      <div className="space-y-4 text-xs text-[#2C3E50]">
        {/* Action Toolbar */}
        <div className="flex items-center justify-between bg-[#F2F4F3] border border-[#e2e6e4] p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2D7D62]" />
            <span className="font-bold text-[#2C3E50]">Pratinjau Dokumen Resmi</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white hover:bg-[#e2e6e4] text-[#2C3E50] border border-[#e2e6e4] font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#2D7D62]" />
              <span>Cetak</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-3.5 py-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Memproses...' : 'Unduh PDF'}</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-[#2D7D62] rounded-xl flex items-center gap-2 font-bold text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Printable Document Container */}
        <div className="bg-white border border-[#e2e6e4] rounded-2xl p-6 shadow-sm overflow-y-auto max-h-[65vh]">
          <div id="pdf-preview-content" className="bg-white p-6 space-y-6 text-[#2C3E50] text-xs">
            {children}
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#F2F4F3] hover:bg-[#e2e6e4] text-[#2C3E50] font-bold rounded-xl border border-[#e2e6e4]"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
