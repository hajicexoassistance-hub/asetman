import React, { useState } from 'react';
import { BeritaAcaraDoc, JenisBeritaAcara, UserRole } from '../types';
import { formatDateIndonesian } from '../utils/dateUtils';
import { PdfPreviewModal } from './PdfPreviewModal';
import { Plus, FileCheck2, Printer, Search, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

interface BeritaAcaraTabProps {
  docs: BeritaAcaraDoc[];
  userRole: UserRole;
  onOpenNewBADrawer: () => void;
  onViewDocDrawer: (doc: BeritaAcaraDoc) => void;
}

export const BeritaAcaraTab: React.FC<BeritaAcaraTabProps> = ({
  docs,
  userRole,
  onOpenNewBADrawer,
  onViewDocDrawer,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Semua');
  const [previewDoc, setPreviewDoc] = useState<BeritaAcaraDoc | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const filteredDocs = docs.filter((d) => {
    if (selectedFilter !== 'Semua' && d.Jenis_BA !== selectedFilter) return false;
    return true;
  });

  const handleOpenPdfPreview = (doc: BeritaAcaraDoc) => {
    setPreviewDoc(doc);
    setIsPdfModalOpen(true);
  };

  const itemList = previewDoc?.Aset_List || [];

  return (
    <div className="space-y-4 pb-24 pt-2 animate-in fade-in text-xs text-[#2C3E50]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-[#2C3E50] tracking-tight">Vault Berita Acara Digital</h2>
          <p className="text-[11px] text-[#7F8C8D]">Dokumen BAST, Mutasi, Penghapusan, & Pelelangan</p>
        </div>

        <button
          onClick={onOpenNewBADrawer}
          className="flex items-center gap-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Buat BA Baru</span>
        </button>
      </div>

      {/* Filter Horizontal Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {['Semua', 'BAST Penerimaan', 'BAST Peminjaman', 'BA Mutasi', 'BA Penghapusan', 'BA Pelelangan'].map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all border ${
                selectedFilter === filter
                  ? 'bg-[#2D7D62] text-white border-[#2D7D62] shadow-xs'
                  : 'bg-[#F2F4F3] text-[#7F8C8D] border-[#e2e6e4] hover:bg-white'
              }`}
            >
              {filter}
            </button>
          )
        )}
      </div>

      {/* Document Cards Repository */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="p-8 text-center bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl text-[#7F8C8D]">
            Belum ada arsip Berita Acara digital yang tersimpan.
          </div>
        ) : (
          filteredDocs.map((doc, idx) => (
            <div
              key={`batab-${doc.ID_BA || doc.Nomor_BA}-${idx}`}
              className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl p-4 shadow-xs space-y-3 hover:border-[#2D7D62]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#2D7D62] font-mono tracking-wider uppercase block">
                    {doc.Jenis_BA}
                  </span>
                  <h3 className="text-sm font-extrabold text-[#2C3E50] mt-0.5">{doc.Nomor_BA}</h3>
                  <p className="text-[11px] text-[#7F8C8D] mt-0.5">
                    Aset: <strong className="text-[#2C3E50]">{doc.Nama_Asset}</strong> ({doc.ID_Asset})
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#A8E6CF] text-[#2D7D62]">
                  {doc.Status_BA}
                </span>
              </div>

              {/* Pihak Terkait Bar */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-white border border-[#e2e6e4] rounded-xl text-[11px]">
                <div>
                  <span className="text-[#7F8C8D] block">Pihak 1 (Petugas):</span>
                  <strong className="text-[#2C3E50]">{doc.Nama_Pihak_1 || '-'}</strong>
                </div>
                <div>
                  <span className="text-[#7F8C8D] block">Pihak 2 (Penerima):</span>
                  <strong className="text-[#2C3E50]">{doc.Nama_Pihak_2 || '-'}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7F8C8D] pt-1 border-t border-[#e2e6e4]">
                <span>Tanggal: {formatDateIndonesian(doc.Tanggal_BA)}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onViewDocDrawer(doc)}
                    className="text-[#7F8C8D] hover:text-[#2C3E50] font-semibold"
                  >
                    Edit / TTD
                  </button>
                  <button
                    onClick={() => handleOpenPdfPreview(doc)}
                    className="flex items-center gap-1 text-[#2D7D62] hover:underline font-bold"
                  >
                    <FileText className="w-3.5 h-3.5" /> Lihat PDF
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewDoc && (
        <PdfPreviewModal
          isOpen={isPdfModalOpen}
          onClose={() => {
            setIsPdfModalOpen(false);
            setPreviewDoc(null);
          }}
          title={`Dokumen Resmi ${previewDoc.Jenis_BA}`}
          subtitle={`Nomor: ${previewDoc.Nomor_BA}`}
          filename={previewDoc.Nomor_BA.replace(/[/\\?%*:|"<>]/g, '-')}
        >
          {/* Official Document Paper Content */}
          <div className="space-y-6 text-slate-900 font-serif text-xs leading-relaxed">
            {/* Kop Surat */}
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
              <h2 className="text-base font-extrabold tracking-wide uppercase text-slate-950 font-sans">
                PEMERINTAH / INSTANSI TATA KELOLA ASET
              </h2>
              <p className="text-[10px] text-slate-600 font-sans">
                Jl. Administrasi Utama No. 01, Gedung Perkantoran · Telp: (021) 555-0199
              </p>
            </div>

            {/* Title */}
            <div className="text-center mb-5 font-sans">
              <h3 className="text-sm font-black underline tracking-wider uppercase text-slate-900">
                {previewDoc.Jenis_BA}
              </h3>
              <p className="text-[11px] font-bold text-slate-700 mt-0.5">Nomor: {previewDoc.Nomor_BA}</p>
            </div>

            <p className="mb-3">
              Pada hari ini <strong className="font-sans">{formatDateIndonesian(previewDoc.Tanggal_BA)}</strong>, kami yang bertanda tangan di bawah ini:
            </p>

            <div className="space-y-2 mb-4 pl-3 border-l-2 border-slate-300">
              <div>
                <strong>1. Nama:</strong> {previewDoc.Nama_Pihak_1 || '-'} <br />
                <span className="text-[11px] text-slate-700">Jabatan: {previewDoc.Jabatan_Pihak_1 || 'Petugas Aset'}</span> (Selanjutnya disebut <strong>Pihak Pertama</strong>)
              </div>
              <div>
                <strong>2. Nama:</strong> {previewDoc.Nama_Pihak_2 || '-'} <br />
                <span className="text-[11px] text-slate-700">Jabatan: {previewDoc.Jabatan_Pihak_2 || 'Penerima'}</span> (Selanjutnya disebut <strong>Pihak Kedua</strong>)
              </div>
            </div>

            <p className="mb-3">
              Menyatakan bahwa Pihak Pertama telah menyerahkan/memproses kepada Pihak Kedua, dan Pihak Kedua telah menerima/menyetujui barang aset kantor dengan rincian sebagai berikut:
            </p>

            <table className="w-full border-collapse border border-slate-800 text-[11px] mb-4 font-sans">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-800 font-bold">
                  <th className="border border-slate-800 p-1.5 text-center w-10">No</th>
                  <th className="border border-slate-800 p-1.5 text-left">Kode Aset</th>
                  <th className="border border-slate-800 p-1.5 text-left">Nama Barang</th>
                  <th className="border border-slate-800 p-1.5 text-left">Kategori / Unit</th>
                  <th className="border border-slate-800 p-1.5 text-center">Kondisi Fisik</th>
                  <th className="border border-slate-800 p-1.5 text-left">Catatan Khusus</th>
                </tr>
              </thead>
              <tbody>
                {itemList.length > 0 ? (
                  itemList.map((item, idx) => (
                    <tr key={`${item.ID_Asset}-${idx}`}>
                      <td className="border border-slate-800 p-1.5 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-800 p-1.5 font-mono font-bold">{item.ID_Asset}</td>
                      <td className="border border-slate-800 p-1.5 font-semibold">{item.Nama_Asset}</td>
                      <td className="border border-slate-800 p-1.5">{item.Kategori} ({item.Unit_Kerja})</td>
                      <td className="border border-slate-800 p-1.5 text-center font-semibold">{item.Kondisi || 'Baik'}</td>
                      <td className="border border-slate-800 p-1.5 text-slate-700 italic">{item.Catatan_Khusus_Item || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border border-slate-800 p-1.5 text-center font-bold">1</td>
                    <td className="border border-slate-800 p-1.5 font-mono font-bold">{previewDoc.ID_Asset}</td>
                    <td className="border border-slate-800 p-1.5 font-semibold">{previewDoc.Nama_Asset}</td>
                    <td className="border border-slate-800 p-1.5">{previewDoc.Kategori} ({previewDoc.Unit_Asal || '-'})</td>
                    <td className="border border-slate-800 p-1.5 text-center font-semibold">Baik</td>
                    <td className="border border-slate-800 p-1.5 text-slate-700 italic">{previewDoc.Alasan_Keterangan || '-'}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <p className="mb-4">
              <strong>Catatan / Alasan:</strong> {previewDoc.Alasan_Keterangan || 'Tidak ada catatan tambahan.'}
            </p>

            <div className="grid grid-cols-2 gap-4 text-center mt-8 pt-4 font-sans text-[11px]">
              <div>
                <p className="font-semibold text-slate-800 mb-1">Pihak Pertama (Pengeluar)</p>
                <div className="h-16 flex items-center justify-center my-1">
                  {previewDoc.TTD_Pihak_1 ? (
                    <img src={previewDoc.TTD_Pihak_1} alt="TTD Pihak 1" className="max-h-14 max-w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">(Belum Tanda Tangan)</span>
                  )}
                </div>
                <p className="font-bold underline text-slate-950">{previewDoc.Nama_Pihak_1 || '(Nama Petugas)'}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-800 mb-1">Pihak Kedua (Penerima)</p>
                <div className="h-16 flex items-center justify-center my-1">
                  {previewDoc.TTD_Pihak_2 ? (
                    <img src={previewDoc.TTD_Pihak_2} alt="TTD Pihak 2" className="max-h-14 max-w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">(Belum Tanda Tangan)</span>
                  )}
                </div>
                <p className="font-bold underline text-slate-950">{previewDoc.Nama_Pihak_2 || '(Nama Penerima)'}</p>
              </div>
            </div>
          </div>
        </PdfPreviewModal>
      )}
    </div>
  );
};
