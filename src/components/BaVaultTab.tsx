import React, { useState } from 'react';
import { BeritaAcaraDoc, Asset, UserRole, PosActionMode } from '../types';
import { exportAuditReportToExcel } from '../services/excelService';
import { formatDateIndonesian } from '../utils/dateUtils';
import {
  FileText,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Building2,
  User,
  Calendar,
  Layers,
  ArrowLeftRight,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface BaVaultTabProps {
  docs: BeritaAcaraDoc[];
  assets: Asset[];
  userRole: UserRole;
  assignedUnit: string;
  units: string[];
  onOpenPosModeWithItems?: (mode: PosActionMode, items: Asset[], refLoanBaId?: string) => void;
  onOpenAssetDetail?: (asset: Asset) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const BaVaultTab: React.FC<BaVaultTabProps> = ({
  docs,
  assets,
  userRole,
  assignedUnit,
  units,
  onOpenPosModeWithItems,
  onOpenAssetDetail,
  onShowToast,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<BeritaAcaraDoc | null>(docs[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [jenisFilter, setJenisFilter] = useState<string>('Semua');
  const [unitFilter, setUnitFilter] = useState<string>('Semua');
  const [statusSiklusFilter, setStatusSiklusFilter] = useState<string>('Semua');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const todayStr = new Date().toISOString().substring(0, 10);
  const currentMonthStr = new Date().toISOString().substring(0, 7);

  // Filter scoped docs
  const scopedDocs = docs.filter((doc) => {
    if (userRole !== 'Admin' && assignedUnit) {
      const matchUnit =
        (doc.Unit_Asal && doc.Unit_Asal.toLowerCase().includes(assignedUnit.toLowerCase())) ||
        (doc.Unit_Tujuan && doc.Unit_Tujuan.toLowerCase().includes(assignedUnit.toLowerCase()));
      if (!matchUnit) return false;
    }
    return true;
  });

  const filteredDocs = scopedDocs.filter((doc) => {
    if (jenisFilter !== 'Semua' && doc.Jenis_BA !== jenisFilter) return false;
    if (unitFilter !== 'Semua' && doc.Unit_Asal !== unitFilter && doc.Unit_Tujuan !== unitFilter) return false;

    // Status siklus filter logic
    if (statusSiklusFilter !== 'Semua') {
      const isLoan = doc.Jenis_BA === 'BAST Peminjaman';
      const isOverdue = isLoan && doc.Target_Kembali && doc.Target_Kembali < todayStr && doc.Status_Siklus !== 'Selesai Dikembalikan';
      const currentStatus = doc.Status_Siklus || (isOverdue ? 'Overdue' : isLoan ? 'Dipinjam-Aktif' : 'Terarsip/Sah');
      if (currentStatus !== statusSiklusFilter) return false;
    }

    if (startDate && doc.Tanggal_BA < startDate) return false;
    if (endDate && doc.Tanggal_BA > endDate) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNo = doc.Nomor_BA.toLowerCase().includes(q);
      const matchPihak1 = doc.Nama_Pihak_1 && doc.Nama_Pihak_1.toLowerCase().includes(q);
      const matchPihak2 = doc.Nama_Pihak_2 && doc.Nama_Pihak_2.toLowerCase().includes(q);
      const matchAsset = doc.Nama_Asset && doc.Nama_Asset.toLowerCase().includes(q);
      const matchSingleId = doc.ID_Asset && doc.ID_Asset.toLowerCase().includes(q);

      // Search inside Aset_List JSON snapshot items
      const matchSnapshotItem = doc.Aset_List?.some(
        (item) =>
          item.ID_Asset.toLowerCase().includes(q) ||
          item.Nama_Asset.toLowerCase().includes(q)
      );

      if (!matchNo && !matchPihak1 && !matchPihak2 && !matchAsset && !matchSingleId && !matchSnapshotItem) {
        return false;
      }
    }
    return true;
  });

  // Calculate KPI Metrics
  const totalBaTerbit = scopedDocs.length;
  const totalBaBulanIni = scopedDocs.filter((d) => d.Tanggal_BA && d.Tanggal_BA.startsWith(currentMonthStr)).length;

  const activeLoansList = scopedDocs.filter(
    (d) => d.Jenis_BA === 'BAST Peminjaman' && d.Status_Siklus !== 'Selesai Dikembalikan'
  );
  const totalPeminjamanAktif = activeLoansList.length;
  const totalOverdue = activeLoansList.filter((d) => d.Target_Kembali && d.Target_Kembali < todayStr).length;

  const mutasiTerimaBulanIni = scopedDocs.filter(
    (d) =>
      (d.Jenis_BA === 'BAST Penerimaan' || d.Jenis_BA === 'BA Mutasi') &&
      d.Tanggal_BA &&
      d.Tanggal_BA.startsWith(currentMonthStr)
  ).length;

  const asetDihapusCount = scopedDocs.filter((d) => d.Jenis_BA === 'BA Penghapusan').length;

  const handleExportRegisterExcel = () => {
    onShowToast(`Buku Register Berita Acara (${filteredDocs.length} Dokumen) diekspor!`, 'success');
    exportAuditReportToExcel(assets, []);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  const handleReturnLoanFromBa = (doc: BeritaAcaraDoc) => {
    if (!onOpenPosModeWithItems) return;
    const itemsToReturn = doc.Aset_List && doc.Aset_List.length > 0
      ? doc.Aset_List
      : assets.filter((a) => a.ID_Asset === doc.ID_Asset);

    onOpenPosModeWithItems('kembali', itemsToReturn, doc.ID_BA);
    onShowToast(`Item dari BA ${doc.Nomor_BA} dialihkan ke POS Pengembalian!`, 'info');
  };

  const handleFindAssetDetail = (assetId: string) => {
    const found = assets.find((a) => a.ID_Asset === assetId);
    if (found && onOpenAssetDetail) {
      onOpenAssetDetail(found);
    } else {
      onShowToast(`Informasi Aset [${assetId}] dimuat dari Snapshot BA.`, 'info');
    }
  };

  return (
    <div className="space-y-2.5 pb-4 pt-1 animate-in fade-in text-xs text-[#2C3E50]">
      {/* Title Header */}
      <div className="px-0.5">
        <h2 className="text-sm font-bold text-[#2C3E50] tracking-tight flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#2D7D62]" />
          <span>Arsip Berita Acara (BA Vault)</span>
        </h2>
        <p className="text-[10px] text-[#7F8C8D]">
          Register Surat Resmi, Legalitas Aset, & Live Preview A4
        </p>
      </div>

      {/* ZONA ATAS: Single Compact Donut KPI Card */}
      {(() => {
        const totalDocsCount = scopedDocs.length;
        const total = totalDocsCount || 1;
        const c = 188.495; // Circumference for r=30 (2 * pi * 30)

        // Categorize ALL scoped docs into 5 mutually exclusive groups:
        const cntTerimaMutasi = scopedDocs.filter(
          (d) => d.Jenis_BA === 'BAST Penerimaan' || d.Jenis_BA === 'BA Mutasi'
        ).length;

        const activeLoansList = scopedDocs.filter(
          (d) => d.Jenis_BA === 'BAST Peminjaman' && d.Status_Siklus !== 'Selesai Dikembalikan'
        );
        const cntOverdue = activeLoansList.filter(
          (d) => d.Target_Kembali && d.Target_Kembali < todayStr
        ).length;
        const cntPinjamNormal = activeLoansList.length - cntOverdue;

        const cntAfkir = scopedDocs.filter((d) => d.Jenis_BA === 'BA Penghapusan').length;

        const cntPengembalianSo = Math.max(
          0,
          totalDocsCount - (cntTerimaMutasi + cntPinjamNormal + cntOverdue + cntAfkir)
        );

        // Calculate arc lengths for SVG strokeDasharray
        const pTerima = (cntTerimaMutasi / total) * c;
        const pPinjam = (cntPinjamNormal / total) * c;
        const pOverdue = (cntOverdue / total) * c;
        const pSelesai = (cntPengembalianSo / total) * c;
        const pAfkir = (cntAfkir / total) * c;

        // Calculate cumulative offsets
        let offset = 0;
        const dashTerima = `${pTerima} ${c - pTerima}`;
        const offsetTerima = -offset;
        offset += pTerima;

        const dashPinjam = `${pPinjam} ${c - pPinjam}`;
        const offsetPinjam = -offset;
        offset += pPinjam;

        const dashOverdue = `${pOverdue} ${c - pOverdue}`;
        const offsetOverdue = -offset;
        offset += pOverdue;

        const dashSelesai = `${pSelesai} ${c - pSelesai}`;
        const offsetSelesai = -offset;
        offset += pSelesai;

        const dashAfkir = `${pAfkir} ${c - pAfkir}`;
        const offsetAfkir = -offset;

        // Percentages
        const pctTerima = Math.round((cntTerimaMutasi / total) * 100);
        const pctPinjam = Math.round((activeLoansList.length / total) * 100);
        const pctSelesai = Math.round((cntPengembalianSo / total) * 100);
        const pctAfkir = Math.round((cntAfkir / total) * 100);

        return (
          <div className="bg-white border border-[#e2e6e4] rounded-xl p-2.5 shadow-2xs flex flex-row items-center justify-between gap-2.5">
            {/* Left: SVG Donut Chart Mini */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 sm:w-18 sm:h-18 -rotate-90 transform" viewBox="0 0 84 84">
                  {totalDocsCount === 0 ? (
                    <circle
                      cx="42"
                      cy="42"
                      r="30"
                      fill="transparent"
                      stroke="#E2E8F0"
                      strokeWidth="9"
                    />
                  ) : (
                    <>
                      {/* Segment 1: BAST Terima & Mutasi (Emerald) */}
                      {pTerima > 0 && (
                        <circle
                          cx="42"
                          cy="42"
                          r="30"
                          fill="transparent"
                          stroke="#2D7D62"
                          strokeWidth="9"
                          strokeDasharray={dashTerima}
                          strokeDashoffset={offsetTerima}
                        />
                      )}
                      {/* Segment 2: Pinjam Aktif Normal (Amber) */}
                      {pPinjam > 0 && (
                        <circle
                          cx="42"
                          cy="42"
                          r="30"
                          fill="transparent"
                          stroke="#F59E0B"
                          strokeWidth="9"
                          strokeDasharray={dashPinjam}
                          strokeDashoffset={offsetPinjam}
                        />
                      )}
                      {/* Segment 3: Overdue (Rose) */}
                      {pOverdue > 0 && (
                        <circle
                          cx="42"
                          cy="42"
                          r="30"
                          fill="transparent"
                          stroke="#EF4444"
                          strokeWidth="9"
                          strokeDasharray={dashOverdue}
                          strokeDashoffset={offsetOverdue}
                        />
                      )}
                      {/* Segment 4: Pengembalian & SO (Blue) */}
                      {pSelesai > 0 && (
                        <circle
                          cx="42"
                          cy="42"
                          r="30"
                          fill="transparent"
                          stroke="#3B82F6"
                          strokeWidth="9"
                          strokeDasharray={dashSelesai}
                          strokeDashoffset={offsetSelesai}
                        />
                      )}
                      {/* Segment 5: Afkir / Pemusnahan (Purple) */}
                      {pAfkir > 0 && (
                        <circle
                          cx="42"
                          cy="42"
                          r="30"
                          fill="transparent"
                          stroke="#8B5CF6"
                          strokeWidth="9"
                          strokeDasharray={dashAfkir}
                          strokeDashoffset={offsetAfkir}
                        />
                      )}
                    </>
                  )}
                </svg>

                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none pointer-events-none">
                  <span className="text-xs sm:text-sm font-black text-[#2C3E50] font-mono tabular-nums">
                    {totalDocsCount}
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-bold text-[#7F8C8D] uppercase mt-0.5">
                    Total BA
                  </span>
                </div>
              </div>

              <div className="h-8 sm:h-10 w-[1px] bg-[#E2E8F0] shrink-0" />
            </div>

            {/* Middle: Clean Unboxed Legend & Micro Stats List with Percentages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 flex-1 min-w-0 text-[11px]">
              {/* Stat 1: Mutasi & BAST Terima */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#2D7D62] shrink-0" />
                <span className="text-[#7F8C8D] font-medium text-[10px] sm:text-[11px] truncate">Terima & Mutasi:</span>
                <strong className="font-mono text-xs text-[#2C3E50] font-bold">{cntTerimaMutasi}</strong>
                <span className="text-[9px] text-[#2D7D62] font-semibold shrink-0">({pctTerima}%)</span>
              </div>

              {/* Stat 2: Pinjam Aktif */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${cntOverdue > 0 ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <span className="text-[#7F8C8D] font-medium text-[10px] sm:text-[11px] truncate">Pinjam Aktif:</span>
                <strong className="font-mono text-xs text-[#2C3E50] font-bold">{activeLoansList.length}</strong>
                <span className="text-[9px] text-amber-700 font-semibold shrink-0">({pctPinjam}%)</span>
                {cntOverdue > 0 && (
                  <span className="text-[9px] text-rose-600 font-bold bg-rose-100 px-1 rounded flex items-center gap-0.5 shrink-0">
                    <AlertTriangle className="w-2 h-2 inline" /> {cntOverdue}
                  </span>
                )}
              </div>

              {/* Stat 3: Pengembalian & SO */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-[#7F8C8D] font-medium text-[10px] sm:text-[11px] truncate">Kembali & SO:</span>
                <strong className="font-mono text-xs text-[#2C3E50] font-bold">{cntPengembalianSo}</strong>
                <span className="text-[9px] text-blue-700 font-semibold shrink-0">({pctSelesai}%)</span>
              </div>

              {/* Stat 4: Afkir / Pemusnahan */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                <span className="text-[#7F8C8D] font-medium text-[10px] sm:text-[11px] truncate">Afkir / Musnah:</span>
                <strong className="font-mono text-xs text-[#2C3E50] font-bold">{cntAfkir}</strong>
                <span className="text-[9px] text-purple-700 font-semibold shrink-0">({pctAfkir}%)</span>
              </div>
            </div>

            {/* Right: Compact Icon Button for Export */}
            <button
              type="button"
              onClick={handleExportRegisterExcel}
              className="p-2 bg-[#F8FAFC] hover:bg-emerald-50 text-[#2D7D62] border border-[#e2e6e4] hover:border-[#2D7D62]/50 rounded-lg shadow-2xs transition-all cursor-pointer shrink-0"
              title="Ekspor Buku Register (Excel)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}

      {/* FILTER PINTAR & OMNI-SEARCH - SINGLE ROW HIGH DENSITY STRIP */}
      <div className="bg-[#F2F4F3] p-2 border border-[#e2e6e4] rounded-xl space-y-1.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-1.5">
          {/* Omni Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#7F8C8D] absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. BA, Tag ID, PIC..."
              className="w-full bg-white border border-[#e2e6e4] rounded-lg pl-8 pr-2 py-1.5 text-[11px] text-[#2C3E50] font-medium focus:outline-none focus:ring-1 focus:ring-[#2D7D62]"
            />
          </div>

          {/* Compact Dropdown Filters */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
            <select
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
              className="bg-white border border-[#e2e6e4] rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#2C3E50] focus:outline-none shrink-0"
            >
              <option value="Semua">Semua Jenis BA</option>
              <option value="BAST Penerimaan">BAST Penerimaan</option>
              <option value="BAST Peminjaman">BAST Peminjaman</option>
              <option value="BA Pengembalian">BA Pengembalian</option>
              <option value="BA Mutasi">BA Mutasi</option>
              <option value="BA Penghapusan">BA Penghapusan</option>
              <option value="BA Stock Opname">BA Stock Opname</option>
            </select>

            <select
              value={statusSiklusFilter}
              onChange={(e) => setStatusSiklusFilter(e.target.value)}
              className="bg-white border border-[#e2e6e4] rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#2C3E50] focus:outline-none shrink-0"
            >
              <option value="Semua">Semua Status</option>
              <option value="Terarsip/Sah">Terarsip/Sah</option>
              <option value="Dipinjam-Aktif">Dipinjam-Aktif</option>
              <option value="Overdue">Overdue</option>
              <option value="Selesai Dikembalikan">Selesai Dikembalikan</option>
            </select>

            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="bg-white border border-[#e2e6e4] rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#2C3E50] focus:outline-none shrink-0"
            >
              <option value="Semua">Semua Unit</option>
              {units.map((u) => (
                <option key={`vunit-${u}`} value={u}>
                  {u}
                </option>
              ))}
            </select>

            {/* Date Pickers */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-[#e2e6e4] rounded-lg px-1.5 py-1 text-[11px] shrink-0"
            />
            <span className="text-[#7F8C8D] text-[10px]">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-[#e2e6e4] rounded-lg px-1.5 py-1 text-[11px] shrink-0"
            />

            {(startDate || endDate || searchQuery || jenisFilter !== 'Semua' || statusSiklusFilter !== 'Semua' || unitFilter !== 'Semua') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setJenisFilter('Semua');
                  setStatusSiklusFilter('Semua');
                  setUnitFilter('Semua');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-rose-600 font-bold hover:underline px-1 text-[10px] shrink-0 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN SPLIT VIEWPORT (60% Desktop Register Table & 40% Desktop Live Preview Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* ZONA KIRI (60% Desktop): Buku Register Table */}
        <div className="lg:col-span-7 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#2C3E50] px-0.5">
            <span>Buku Register ({filteredDocs.length} Dokumen)</span>
          </div>

          <div className="bg-white border border-[#e2e6e4] rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-h-[68vh]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8FAFC] border-b border-[#e2e6e4] sticky top-0 z-10 text-[9px] uppercase font-bold text-[#7F8C8D]">
                  <tr>
                    <th className="py-2 px-2.5">No. & Tgl BA</th>
                    <th className="py-2 px-2.5">Jenis</th>
                    <th className="py-2 px-2.5">Para Pihak</th>
                    <th className="py-2 px-2.5">Barang</th>
                    <th className="py-2 px-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F3] text-[11px]">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-3 text-center text-[#7F8C8D] text-xs">
                        Tidak ada dokumen Berita Acara yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc, idx) => {
                      const isSelected = selectedDoc?.ID_BA === doc.ID_BA;
                      const isLoan = doc.Jenis_BA === 'BAST Peminjaman';
                      const isOverdue =
                        isLoan && doc.Target_Kembali && doc.Target_Kembali < todayStr && doc.Status_Siklus !== 'Selesai Dikembalikan';

                      const statusSiklusLabel =
                        doc.Status_Siklus ||
                        (isOverdue ? 'Overdue' : isLoan ? 'Dipinjam-Aktif' : 'Terarsip/Sah');

                      const itemCount = doc.Aset_List?.length || 1;

                      return (
                        <tr
                          key={`bavault-${doc.ID_BA || doc.Nomor_BA}-${idx}`}
                          onClick={() => setSelectedDoc(doc)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-50/80 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-1.5 px-2.5">
                            <span className="font-mono font-bold text-[#2D7D62] text-[11px] block truncate max-w-[130px]">
                              {doc.Nomor_BA}
                            </span>
                            <span className="text-[9px] text-[#7F8C8D] block">
                              {formatDateIndonesian(doc.Tanggal_BA)}
                            </span>
                          </td>

                          <td className="py-1.5 px-2.5">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold whitespace-nowrap ${
                                doc.Jenis_BA === 'BAST Penerimaan'
                                  ? 'bg-blue-100 text-blue-800'
                                  : doc.Jenis_BA === 'BAST Peminjaman'
                                  ? 'bg-amber-100 text-amber-800'
                                  : doc.Jenis_BA === 'BA Pengembalian'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doc.Jenis_BA === 'BA Mutasi'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {doc.Jenis_BA}
                            </span>
                          </td>

                          <td className="py-1.5 px-2.5">
                            <div className="text-[10px] truncate max-w-[120px]">
                              <span className="font-bold text-[#2C3E50]">{doc.Nama_Pihak_1 || '-'}</span>
                              <span className="text-[#7F8C8D]"> → </span>
                              <span className="font-bold text-[#2D7D62]">{doc.Nama_Pihak_2 || '-'}</span>
                            </div>
                            <span className="text-[9px] text-[#7F8C8D] block truncate max-w-[120px]">
                              {doc.Unit_Asal} → {doc.Unit_Tujuan}
                            </span>
                          </td>

                          <td className="py-1.5 px-2.5">
                            <span className="font-bold text-[#2C3E50] text-[10px] block truncate max-w-[130px]">
                              {itemCount > 1 ? `${itemCount} Item (${doc.Nama_Asset})` : doc.Nama_Asset}
                            </span>
                            <span className="font-mono text-[9px] text-[#7F8C8D] block">
                              {itemCount > 1 ? `Batch` : doc.ID_Asset}
                            </span>
                          </td>

                          <td className="py-1.5 px-2.5">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold whitespace-nowrap ${
                                statusSiklusLabel === 'Overdue'
                                  ? 'bg-rose-100 text-rose-800 animate-pulse'
                                  : statusSiklusLabel === 'Dipinjam-Aktif'
                                  ? 'bg-amber-100 text-amber-800'
                                  : statusSiklusLabel === 'Selesai Dikembalikan'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {statusSiklusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ZONA KANAN (40% Desktop): Live Document Preview A4 */}
        <div className="lg:col-span-5 sticky top-14">
          {selectedDoc ? (
            <div className="bg-white border border-[#e2e6e4] rounded-xl shadow-md p-3.5 space-y-3 printable-area">
              {/* Top Document Actions Header */}
              <div className="flex items-center justify-between border-b border-[#F2F4F3] pb-2 no-print">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#2C3E50]">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#2D7D62]" />
                  <span>Preview Dokumen A4</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrintDocument}
                    className="px-2.5 py-1 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-[11px] rounded-lg flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Cetak PDF</span>
                  </button>
                </div>
              </div>

              {/* PAIRED DOCUMENT CROSS-LINK / RETURN TRIGGER BUTTON */}
              {selectedDoc.Jenis_BA === 'BAST Peminjaman' &&
                selectedDoc.Status_Siklus !== 'Selesai Dikembalikan' && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5 no-print">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Peminjaman Aktif
                      </span>
                      {selectedDoc.Target_Kembali && (
                        <span className="text-[10px] font-mono">Kembali: {selectedDoc.Target_Kembali}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReturnLoanFromBa(selectedDoc)}
                      className="w-full py-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Proses Pengembalian</span>
                    </button>
                  </div>
                )}

              {selectedDoc.Ref_BA_Pasangan && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-center justify-between no-print">
                  <span>Dikembalikan</span>
                  <span className="font-mono font-bold">{selectedDoc.Ref_BA_Pasangan}</span>
                </div>
              )}

              {/* FORMAL A4 SHEET PREVIEW */}
              <div className="border border-[#e2e6e4] p-4 rounded-lg bg-white space-y-3 text-slate-800 text-[11px] font-serif leading-relaxed shadow-2xs">
                {/* Formal Letterhead Kop */}
                <div className="border-b-2 border-slate-900 pb-2 text-center space-y-0.5">
                  <h1 className="font-sans font-black text-xs uppercase tracking-wider text-slate-900">
                    NURSERY CIMINYAK · DEPARTEMEN ASET & GA
                  </h1>
                  <p className="text-[9px] font-sans text-slate-500">
                    Jl. Raya Ciminyak No. 45 · Telp: (021) 555-8900
                  </p>
                </div>

                {/* Document Title & Number */}
                <div className="text-center space-y-0.5 pt-0.5">
                  <h2 className="font-sans font-extrabold text-[11px] uppercase tracking-wide text-slate-900">
                    BERITA ACARA {selectedDoc.Jenis_BA.toUpperCase()}
                  </h2>
                  <p className="font-mono font-bold text-[10px] text-[#2D7D62]">
                    No: {selectedDoc.Nomor_BA}
                  </p>
                </div>

                {/* Opening Legal Statement */}
                <p className="text-[10px] text-justify">
                  Pada hari ini, <strong className="font-sans">{formatDateIndonesian(selectedDoc.Tanggal_BA)}</strong>,
                  dilaksanakan serah terima aset dengan rincian:
                </p>

                {/* Parties Grid */}
                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 border border-slate-200 rounded text-[10px] font-sans">
                  <div>
                    <strong className="block text-slate-900 text-[9px] uppercase tracking-wider mb-0.5">
                      PIHAK 1 (PENYERAH):
                    </strong>
                    <span className="font-bold block text-slate-800">{selectedDoc.Nama_Pihak_1 || '-'}</span>
                    <span className="text-slate-500 block text-[9px]">{selectedDoc.Jabatan_Pihak_1 || 'Petugas Aset'}</span>
                    <span className="text-slate-600 block text-[9px] font-semibold">Unit: {selectedDoc.Unit_Asal || '-'}</span>
                  </div>

                  <div>
                    <strong className="block text-slate-900 text-[9px] uppercase tracking-wider mb-0.5">
                      PIHAK 2 (PENERIMA):
                    </strong>
                    <span className="font-bold block text-slate-800">{selectedDoc.Nama_Pihak_2 || '-'}</span>
                    <span className="text-slate-500 block text-[9px]">{selectedDoc.Jabatan_Pihak_2 || 'Penerima Aset'}</span>
                    <span className="text-slate-600 block text-[9px] font-semibold">Unit: {selectedDoc.Unit_Tujuan || '-'}</span>
                  </div>
                </div>

                {/* Itemized Table of Assets Snapshot */}
                <div className="space-y-1 font-sans">
                  <span className="font-bold text-slate-900 text-[10px] block">Daftar Barang Transaksi:</span>
                  <table className="w-full border-collapse border border-slate-300 text-[9px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                        <th className="border border-slate-300 p-1 text-left">Tag ID</th>
                        <th className="border border-slate-300 p-1 text-left">Nama Barang</th>
                        <th className="border border-slate-300 p-1 text-left">Kategori</th>
                        <th className="border border-slate-300 p-1 text-center">Kondisi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDoc.Aset_List && selectedDoc.Aset_List.length > 0 ? (
                        selectedDoc.Aset_List.map((item) => (
                          <tr key={item.ID_Asset} className="border-b border-slate-200">
                            <td className="border border-slate-300 p-1 font-mono font-bold">
                              <button
                                type="button"
                                onClick={() => handleFindAssetDetail(item.ID_Asset)}
                                className="text-[#2D7D62] hover:underline cursor-pointer"
                              >
                                {item.ID_Asset}
                              </button>
                            </td>
                            <td className="border border-slate-300 p-1 font-semibold">{item.Nama_Asset}</td>
                            <td className="border border-slate-300 p-1 text-slate-600">{item.Kategori}</td>
                            <td className="border border-slate-300 p-1 text-center font-bold">{item.Kondisi}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="border border-slate-300 p-1 font-mono font-bold">
                            <button
                              type="button"
                              onClick={() => handleFindAssetDetail(selectedDoc.ID_Asset)}
                              className="text-[#2D7D62] hover:underline cursor-pointer"
                            >
                              {selectedDoc.ID_Asset}
                            </button>
                          </td>
                          <td className="border border-slate-300 p-1 font-semibold">{selectedDoc.Nama_Asset}</td>
                          <td className="border border-slate-300 p-1 text-slate-600">{selectedDoc.Kategori}</td>
                          <td className="border border-slate-300 p-1 text-center font-bold">Baik</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Explanation */}
                <div className="font-sans text-[10px] pt-0.5">
                  <strong>Keterangan:</strong>
                  <p className="italic text-slate-700">{selectedDoc.Alasan_Keterangan || 'Serah terima resmi operasional.'}</p>
                </div>

                {/* Signatures Section */}
                <div className="grid grid-cols-2 gap-3 pt-3 text-center font-sans text-[9px]">
                  <div>
                    <span className="block text-slate-500 mb-1">Pihak 1 (Penyerah)</span>
                    {selectedDoc.TTD_Pihak_1 ? (
                      <img src={selectedDoc.TTD_Pihak_1} alt="TTD 1" className="h-9 mx-auto object-contain mb-0.5" />
                    ) : (
                      <div className="h-9 flex items-center justify-center text-slate-300 italic">[TTD]</div>
                    )}
                    <strong className="block border-t border-slate-400 pt-0.5 text-slate-900">{selectedDoc.Nama_Pihak_1 || 'Pihak 1'}</strong>
                  </div>

                  <div>
                    <span className="block text-slate-500 mb-1">Pihak 2 (Penerima)</span>
                    {selectedDoc.TTD_Pihak_2 ? (
                      <img src={selectedDoc.TTD_Pihak_2} alt="TTD 2" className="h-9 mx-auto object-contain mb-0.5" />
                    ) : (
                      <div className="h-9 flex items-center justify-center text-slate-300 italic">[TTD]</div>
                    )}
                    <strong className="block border-t border-slate-400 pt-0.5 text-slate-900">{selectedDoc.Nama_Pihak_2 || 'Pihak 2'}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white border border-[#e2e6e4] rounded-xl text-center text-[#7F8C8D] text-xs">
              Pilih salah satu baris dokumen dari Buku Register di sebelah kiri untuk melihat preview A4.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

