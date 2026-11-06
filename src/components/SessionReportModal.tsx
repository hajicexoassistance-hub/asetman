import React, { useState } from 'react';
import { SesiSO, Asset } from '../types';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Building2,
  Calendar,
  UserCheck,
  Tag,
  MapPin,
  FileCheck2,
  ArrowRight,
  Filter,
  FileText,
} from 'lucide-react';
import { formatDateIndonesian } from '../utils/dateUtils';
import { exportSingleSessionReportToExcel } from '../services/excelService';
import { PdfPreviewModal } from './PdfPreviewModal';

interface SessionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SesiSO | null;
  allAssets: Asset[];
  onCreateBAForAsset?: (asset: Asset) => void;
}

export const SessionReportModal: React.FC<SessionReportModalProps> = ({
  isOpen,
  onClose,
  session,
  allAssets,
  onCreateBAForAsset,
}) => {
  const [filterCondition, setFilterCondition] = useState<string>('Semua');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  if (!isOpen || !session) return null;

  const targetUnit = session.Target_Unit_Kerja || 'Semua';
  const scopeCat = session.Scope_Kategori || 'Semua';
  const scopeLoc = session.Scope_Lokasi || 'Semua';

  const scopedAssets = allAssets.filter((a) => {
    if (targetUnit !== 'Semua' && a.Unit_Kerja !== targetUnit) return false;
    if (scopeCat !== 'Semua' && a.Kategori !== scopeCat) return false;
    if (scopeLoc !== 'Semua' && a.Lokasi !== scopeLoc) return false;
    return true;
  });

  const totalAssets = scopedAssets.length;
  const verifiedAssets = scopedAssets.filter((a) => a.Status_Audit === 'Sudah SO').length;
  const pendingAssets = totalAssets - verifiedAssets;
  const percentComplete = totalAssets > 0 ? Math.round((verifiedAssets / totalAssets) * 100) : 0;

  let totalBaik = 0;
  let totalRR = 0;
  let totalRB = 0;
  let totalHilang = 0;
  let totalMusnah = 0;

  scopedAssets.forEach((a) => {
    if (a.Rincian_Kondisi) {
      totalBaik += a.Rincian_Kondisi.Baik || 0;
      totalRR += a.Rincian_Kondisi.Rusak_Ringan || 0;
      totalRB += a.Rincian_Kondisi.Rusak_Berat || 0;
      totalHilang += a.Rincian_Kondisi.Hilang || 0;
      totalMusnah += a.Rincian_Kondisi.Musnah || 0;
    } else {
      if (a.Kondisi === 'Baik') totalBaik += a.Jumlah || 1;
      else if (a.Kondisi === 'Rusak Ringan') totalRR += a.Jumlah || 1;
      else if (a.Kondisi === 'Rusak Berat') totalRB += a.Jumlah || 1;
      else if (a.Kondisi === 'Hilang') totalHilang += a.Jumlah || 1;
      else if (a.Kondisi === 'Musnah') totalMusnah += a.Jumlah || 1;
    }
  });

  const totalFisik = totalBaik + totalRR + totalRB + totalHilang + totalMusnah;
  const criticalAssets = scopedAssets.filter(
    (a) => a.Kondisi === 'Rusak Berat' || a.Kondisi === 'Hilang' || a.Kondisi === 'Musnah'
  );

  const displayedAssets = scopedAssets.filter((a) => {
    if (filterCondition !== 'Semua' && a.Kondisi !== filterCondition) return false;
    return true;
  });

  const handleExport = () => {
    exportSingleSessionReportToExcel(session, allAssets);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2C3E50]/60 backdrop-blur-xs animate-in fade-in transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white text-[#2C3E50] rounded-3xl shadow-2xl overflow-hidden border border-[#e2e6e4] z-10 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-[#e2e6e4] bg-[#F8FAFC] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                {session.ID_Sesi}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  session.Status_Sesi === 'Aktif'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                Status: {session.Status_Sesi}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#2C3E50] mt-1 line-clamp-1">
              Laporan Hasil Stock Opname: {session.Nama_Sesi}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#7F8C8D] mt-0.5 flex-wrap">
              <span>Auditor: <strong className="text-[#2C3E50]">{session.Petugas_Utama}</strong></span>
              <span>·</span>
              <span>Pelaksanaan: {formatDateIndonesian(session.Tanggal_Mulai)}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shrink-0"
            title="Tutup Laporan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Report Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-[#2C3E50]">
          {/* Executive Metrics Overview */}
          <div className="bg-[#2D7D62] text-white rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#A8E6CF] uppercase tracking-wider block">
                  Tingkat Ketercapaian Pemeriksaan
                </span>
                <span className="text-2xl font-black tabular-nums tracking-tight">
                  {percentComplete}%
                </span>
                <span className="text-xs text-[#A8E6CF] ml-2 font-medium">
                  ({verifiedAssets} dari {totalAssets} barang terverifikasi)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#A8E6CF] tabular-nums">
                {pendingAssets} Belum Selesai
              </span>
            </div>

            <div className="w-full bg-black/25 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#A8E6CF] h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Physical Condition Breakdown Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center justify-between">
              <span>Distribusi Kondisi Fisik Sesi Ini</span>
              <span className="text-[11px] font-mono text-[#7F8C8D]">Total Fisik: {totalFisik} Unit</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="text-[10px] text-emerald-700 font-bold block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Baik
                </span>
                <span className="text-lg font-black font-mono tabular-nums mt-0.5 block">
                  {totalBaik}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <span className="text-[10px] text-amber-700 font-bold block flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Rusak Ringan
                </span>
                <span className="text-lg font-black font-mono tabular-nums mt-0.5 block">
                  {totalRR}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950">
                <span className="text-[10px] text-orange-700 font-bold block flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Rusak Berat
                </span>
                <span className="text-lg font-black font-mono tabular-nums mt-0.5 block">
                  {totalRB}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950">
                <span className="text-[10px] text-rose-700 font-bold block flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Hilang
                </span>
                <span className="text-lg font-black font-mono tabular-nums mt-0.5 block">
                  {totalHilang}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950">
                <span className="text-[10px] text-purple-700 font-bold block flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Musnah
                </span>
                <span className="text-lg font-black font-mono tabular-nums mt-0.5 block">
                  {totalMusnah}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#e2e6e4] bg-[#F8FAFC] flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#e2e6e4] text-[#2C3E50] font-bold text-xs hover:bg-[#F2F4F3] transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Lihat Laporan PDF</span>
            </button>

            <button
              onClick={handleExport}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal for Stock Opname Report */}
      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title={`Laporan Resmi Stock Opname`}
        subtitle={`Sesi: ${session.Nama_Sesi} (${session.ID_Sesi})`}
        filename={`Laporan-Stock-Opname-${session.ID_Sesi}`}
      >
        <div className="space-y-6 text-slate-900 font-serif text-xs leading-relaxed">
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <h2 className="text-base font-extrabold tracking-wide uppercase text-slate-950 font-sans">
              LAPORAN RESMI HASIL STOCK OPNAME ASET
            </h2>
            <p className="text-[10px] text-slate-600 font-sans">
              Sesi: {session.Nama_Sesi} · ID: {session.ID_Sesi} · Auditor: {session.Petugas_Utama}
            </p>
          </div>

          <div className="space-y-2 font-sans mb-4">
            <p><strong>Tanggal Mulai:</strong> {formatDateIndonesian(session.Tanggal_Mulai)}</p>
            <p><strong>Target Unit Kerja:</strong> {targetUnit}</p>
            <p><strong>Tingkat Ketercapaian:</strong> {percentComplete}% ({verifiedAssets} / {totalAssets} barang terverifikasi)</p>
          </div>

          <table className="w-full border-collapse border border-slate-800 text-[11px] mb-4 font-sans">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-800 font-bold">
                <th className="border border-slate-800 p-1.5 text-center w-10">No</th>
                <th className="border border-slate-800 p-1.5 text-left">Kode Aset</th>
                <th className="border border-slate-800 p-1.5 text-left">Nama Barang</th>
                <th className="border border-slate-800 p-1.5 text-left">Unit / Lokasi</th>
                <th className="border border-slate-800 p-1.5 text-center">Status Audit</th>
                <th className="border border-slate-800 p-1.5 text-center">Kondisi</th>
              </tr>
            </thead>
            <tbody>
              {scopedAssets.map((item, idx) => (
                <tr key={`pdf-so-${item.ID_Asset}-${idx}`}>
                  <td className="border border-slate-800 p-1.5 text-center font-bold">{idx + 1}</td>
                  <td className="border border-slate-800 p-1.5 font-mono font-bold">{item.ID_Asset}</td>
                  <td className="border border-slate-800 p-1.5 font-semibold">{item.Nama_Asset}</td>
                  <td className="border border-slate-800 p-1.5">{item.Unit_Kerja} ({item.Lokasi || '-'})</td>
                  <td className="border border-slate-800 p-1.5 text-center font-semibold">{item.Status_Audit}</td>
                  <td className="border border-slate-800 p-1.5 text-center font-semibold">{item.Kondisi || 'Baik'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-4 text-center mt-8 pt-4 font-sans text-[11px]">
            <div>
              <p className="font-semibold text-slate-800 mb-10">Mengetahui, <br /> Auditor Utama / Pimpinan</p>
              <p className="font-bold underline text-slate-950">{session.Petugas_Utama}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-10">Disetujui oleh, <br /> Penanggung Jawab Aset</p>
              <p className="font-bold underline text-slate-950">Tim Verifikasi Internal</p>
            </div>
          </div>
        </div>
      </PdfPreviewModal>
    </div>
  );
};
