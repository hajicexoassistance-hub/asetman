import React, { useState } from 'react';
import { AssetLoan, UserRole } from '../types';
import { formatDateIndonesian } from '../utils/dateUtils';
import { PdfPreviewModal } from './PdfPreviewModal';
import { Plus, ArrowLeftRight, Clock, AlertTriangle, CheckCircle, User, Calendar, FileText } from 'lucide-react';

interface LoanTabProps {
  loans: AssetLoan[];
  userRole: UserRole;
  onOpenNewLoanDrawer: () => void;
  onOpenReturnLoanDrawer: (loan: AssetLoan) => void;
}

export const LoanTab: React.FC<LoanTabProps> = ({
  loans,
  userRole,
  onOpenNewLoanDrawer,
  onOpenReturnLoanDrawer,
}) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Dipinjam' | 'Overdue' | 'Dikembalikan'>('Dipinjam');
  const [previewLoan, setPreviewLoan] = useState<AssetLoan | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const filteredLoans = loans.filter((l) => {
    if (filterStatus === 'Dipinjam') return l.Status_Pinjam === 'Dipinjam';
    if (filterStatus === 'Overdue') return l.Status_Pinjam === 'Overdue';
    if (filterStatus === 'Dikembalikan') return l.Status_Pinjam === 'Dikembalikan';
    return true;
  });

  const activeCount = loans.filter((l) => l.Status_Pinjam === 'Dipinjam').length;
  const overdueCount = loans.filter((l) => l.Status_Pinjam === 'Overdue').length;

  const handleOpenPdf = (loan: AssetLoan) => {
    setPreviewLoan(loan);
    setIsPdfModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-24 pt-2 animate-in fade-in text-xs text-[#2C3E50]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-[#2C3E50] tracking-tight">Log Peminjaman & Pemakaian</h2>
          <p className="text-[11px] text-[#7F8C8D]">Peminjaman Aset Sementara & Penanggung Jawab</p>
        </div>

        <button
          onClick={onOpenNewLoanDrawer}
          className="flex items-center gap-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Pinjam </span>
        </button>
      </div>

      {/* Status Segment Filter Bar */}
      <div className="flex rounded-xl p-1 bg-[#F2F4F3] border border-[#e2e6e4] text-xs font-semibold">
        <button
          onClick={() => setFilterStatus('Dipinjam')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            filterStatus === 'Dipinjam' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
          }`}
        >
          <span>Active ({activeCount})</span>
        </button>
        <button
          onClick={() => setFilterStatus('Overdue')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            filterStatus === 'Overdue' ? 'bg-amber-600 text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
          }`}
        >
          <span>Overdue ({overdueCount})</span>
        </button>
        <button
          onClick={() => setFilterStatus('Dikembalikan')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            filterStatus === 'Dikembalikan' ? 'bg-white text-[#2C3E50] border border-[#e2e6e4]' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
          }`}
        >
          <span>Selesai</span>
        </button>
        <button
          onClick={() => setFilterStatus('All')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            filterStatus === 'All' ? 'bg-white text-[#2C3E50] border border-[#e2e6e4]' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
          }`}
        >
          <span>Semua ({loans.length})</span>
        </button>
      </div>

      {/* Loan List Cards */}
      <div className="space-y-3">
        {filteredLoans.length === 0 ? (
          <div className="p-8 text-center bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl text-[#7F8C8D]">
            Belum ada data peminjaman aset pada status ini.
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <div
              key={loan.ID_Pinjam}
              className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl p-4 shadow-xs space-y-3 hover:border-[#2D7D62]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-[#2D7D62] text-xs">
                    {loan.ID_Asset}
                  </span>
                  <h3 className="text-sm font-bold text-[#2C3E50] mt-0.5">{loan.Nama_Asset}</h3>
                  <div className="text-[11px] text-[#7F8C8D] flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-[#2D7D62]" />
                    <span>Peminjam: <strong className="text-[#2C3E50]">{loan.Nama_Peminjam}</strong> ({loan.Unit_Peminjam})</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    loan.Status_Pinjam === 'Dipinjam'
                      ? 'bg-[#A8E6CF] text-[#2D7D62]'
                      : loan.Status_Pinjam === 'Overdue'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {loan.Status_Pinjam}
                </span>
              </div>

              {/* Dates & Purpose info */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-white border border-[#e2e6e4] rounded-xl text-[11px]">
                <div>
                  <span className="text-[#7F8C8D] block">Tgl Pinjam:</span>
                  <span className="text-[#2C3E50] font-medium">{formatDateIndonesian(loan.Tanggal_Pinjam)}</span>
                </div>
                <div>
                  <span className="text-[#7F8C8D] block">Target Kembali:</span>
                  <span className="text-amber-700 font-bold">{formatDateIndonesian(loan.Target_Kembali)}</span>
                </div>
              </div>

              {loan.Keperluan && (
                <p className="text-[11px] text-[#7F8C8D] italic bg-white p-2 rounded-lg border border-[#e2e6e4]">
                  Keperluan: "{loan.Keperluan}"
                </p>
              )}

              {/* Footer Return & PDF Action */}
              <div className="pt-2 border-t border-[#e2e6e4] flex items-center justify-between">
                <button
                  onClick={() => handleOpenPdf(loan)}
                  className="flex items-center gap-1 text-[#2D7D62] hover:underline font-bold text-xs"
                >
                  <FileText className="w-3.5 h-3.5" /> Lihat Slip PDF
                </button>

                {loan.Status_Pinjam !== 'Dikembalikan' && (
                  <button
                    onClick={() => onOpenReturnLoanDrawer(loan)}
                    className="flex items-center gap-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Proses Pengembalian Aset</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PDF Preview Modal for Loan Slip */}
      {previewLoan && (
        <PdfPreviewModal
          isOpen={isPdfModalOpen}
          onClose={() => {
            setIsPdfModalOpen(false);
            setPreviewLoan(null);
          }}
          title={`Slip Bukti Peminjaman Aset`}
          subtitle={`ID Pinjam: ${previewLoan.ID_Pinjam}`}
          filename={`Slip-Peminjaman-${previewLoan.ID_Pinjam}`}
        >
          <div className="space-y-6 text-slate-900 font-serif text-xs leading-relaxed">
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
              <h2 className="text-base font-extrabold tracking-wide uppercase text-slate-950 font-sans">
                BUKTI PEMINJAMAN & SERAH TERIMA ASET KANTOR
              </h2>
              <p className="text-[10px] text-slate-600 font-sans">
                ID Slip: {previewLoan.ID_Pinjam} · Petugas: {previewLoan.Petugas_Pinjam || 'Admin'}
              </p>
            </div>

            <div className="space-y-2 font-sans mb-4">
              <p><strong>Nama Peminjam:</strong> {previewLoan.Nama_Peminjam}</p>
              <p><strong>Unit / Divisi:</strong> {previewLoan.Unit_Peminjam}</p>
              <p><strong>Tanggal Pinjam:</strong> {formatDateIndonesian(previewLoan.Tanggal_Pinjam)}</p>
              <p><strong>Target Kembali:</strong> {formatDateIndonesian(previewLoan.Target_Kembali)}</p>
              <p><strong>Keperluan:</strong> {previewLoan.Keperluan || '-'}</p>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[11px] mb-4 font-sans">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-800 font-bold">
                  <th className="border border-slate-800 p-1.5 text-center w-10">No</th>
                  <th className="border border-slate-800 p-1.5 text-left">Kode Aset</th>
                  <th className="border border-slate-800 p-1.5 text-left">Nama Barang</th>
                  <th className="border border-slate-800 p-1.5 text-center">Kondisi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-800 p-1.5 text-center font-bold">1</td>
                  <td className="border border-slate-800 p-1.5 font-mono font-bold">{previewLoan.ID_Asset}</td>
                  <td className="border border-slate-800 p-1.5 font-semibold">{previewLoan.Nama_Asset}</td>
                  <td className="border border-slate-800 p-1.5 text-center">{previewLoan.Kondisi_Saat_Pinjam || 'Baik'}</td>
                </tr>
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-4 text-center mt-8 pt-4 font-sans text-[11px]">
              <div>
                <p className="font-semibold text-slate-800 mb-10">Petugas Pemberi</p>
                <p className="font-bold underline text-slate-950">{previewLoan.Petugas_Pinjam || 'Admin Aset'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-10">Peminjam</p>
                <div className="h-12 flex items-center justify-center my-1">
                  {previewLoan.Tanda_Tangan_Peminjam ? (
                    <img src={previewLoan.Tanda_Tangan_Peminjam} alt="TTD Peminjam" className="max-h-12 max-w-full object-contain" />
                  ) : null}
                </div>
                <p className="font-bold underline text-slate-950">{previewLoan.Nama_Peminjam}</p>
              </div>
            </div>
          </div>
        </PdfPreviewModal>
      )}
    </div>
  );
};
