import React, { useState, useRef } from 'react';
import { Asset, SesiSO, UserRole } from '../types';
import { downloadExcelTemplate, exportAuditReportToExcel, parseUploadedExcel } from '../services/excelService';
import { getStoredGasUrl, setStoredGasUrl } from '../services/apiService';
import { MasterDataTab } from './MasterDataTab';
import {
  Settings,
  UserCheck,
  Building2,
  Code2,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCcw,
  CheckCircle2,
  Save,
  Link,
  ShieldCheck,
  Database,
  Sliders,
} from 'lucide-react';

interface SettingsTabProps {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  assignedUnit: string;
  onAssignedUnitChange: (unit: string) => void;
  units: string[];
  categories: string[];
  onAddCategory: (cat: string) => void;
  onAddUnit: (unit: string) => void;
  gasUrl: string;
  onSaveGasUrl: (url: string) => void;
  onOpenGasModal: () => void;
  assets: Asset[];
  sessions: SesiSO[];
  onImportExcel: (importedAssets: Asset[], importedSessions?: SesiSO[], importedCategories?: string[], importedUnits?: string[]) => void;
  onResetDemo: () => void;
  onRunDepreciationBatch?: () => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  userRole,
  onRoleChange,
  assignedUnit,
  onAssignedUnitChange,
  units,
  categories,
  onAddCategory,
  onAddUnit,
  gasUrl,
  onSaveGasUrl,
  onOpenGasModal,
  assets,
  sessions,
  onImportExcel,
  onResetDemo,
  onRunDepreciationBatch,
  onShowToast,
}) => {
  const [activeAspectTab, setActiveAspectTab] = useState<'master' | 'rbac' | 'gas' | 'tools'>('master');
  const [inputUrl, setInputUrl] = useState(gasUrl);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isConnected = Boolean(gasUrl && gasUrl.trim().length > 0);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredGasUrl(inputUrl);
    onSaveGasUrl(inputUrl.trim());
    onShowToast('URL Google Apps Script berhasil disimpan!', 'success');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Membaca file Excel...');
    try {
      const parsed = await parseUploadedExcel(file);
      if (parsed.assets && parsed.assets.length > 0) {
        onImportExcel(parsed.assets, parsed.sessions, parsed.categories, parsed.units);
        setUploadStatus(`Berhasil mengimpor ${parsed.assets.length} aset dari Excel!`);
        onShowToast(`Impor berhasil! ${parsed.assets.length} aset ditambahkan.`, 'success');
      } else {
        setUploadStatus('File Excel tidak berisi data aset yang valid.');
        onShowToast('File Excel tidak berisi data aset yang valid.', 'error');
      }
    } catch (err: any) {
      setUploadStatus(err.message || 'Gagal mengimpor file Excel.');
      onShowToast(err.message || 'Gagal mengimpor file Excel.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3 pb-20 pt-1 animate-in fade-in text-xs text-[#2C3E50]">
      {/* Title Header */}
      <div className="px-0.5">
        <h2 className="text-sm font-bold text-[#2C3E50] tracking-tight flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-[#2D7D62]" />
          <span>Pengaturan Sistem & Master Data</span>
        </h2>
        <p className="text-[10px] text-[#7F8C8D]">
          Master Data Entitas, Otorisasi Peran, API Google Sheets, & Utilitas Excel
        </p>
      </div>

      {/* 4 Aspect Capsule Sub-Tab Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#F2F4F3] p-1.5 rounded-xl border border-[#e2e6e4]">
        {[
          { key: 'master', label: 'Master Data', icon: Database },
          { key: 'rbac', label: 'Akses & Peran', icon: ShieldCheck },
          { key: 'gas', label: 'Google Sheet', icon: Link },
          { key: 'tools', label: 'Impor/Ekspor', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAspectTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveAspectTab(tab.key as any)}
              className={`py-1.5 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 text-[11px] cursor-pointer ${
                isActive
                  ? 'bg-[#2D7D62] text-white shadow-2xs'
                  : 'bg-white text-[#2C3E50] hover:bg-slate-50 border border-[#e2e6e4]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ASPECT TAB 1: MASTER DATA CRUD */}
      {activeAspectTab === 'master' && (
        <MasterDataTab
          categories={categories}
          units={units}
          onAddCategory={onAddCategory}
          onAddUnit={onAddUnit}
          onShowToast={onShowToast}
        />
      )}

      {/* ASPECT TAB 2: AKSES & PERAN (RBAC) */}
      {activeAspectTab === 'rbac' && (
        <div className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl p-3.5 space-y-3 shadow-2xs">
          <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2D7D62]" /> Profil Pengguna & Scoping Data (RBAC)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-semibold text-[#7F8C8D] block mb-1">Peran Otorisasi (RBAC)</label>
              <select
                value={userRole}
                onChange={(e) => {
                  onRoleChange(e.target.value as UserRole);
                  onShowToast(`Peran diubah ke ${e.target.value}`, 'info');
                }}
                className="w-full bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#2D7D62]"
              >
                <option value="Admin">Admin Utama (Akses Semua Unit)</option>
                <option value="Auditor">Auditor SO (Terkunci Per Unit)</option>
                <option value="Staf">Staf Peminjam (Terkunci Per Unit)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#7F8C8D] block mb-1">Unit Kerja Terdaftar (Scope Data)</label>
              <select
                value={assignedUnit}
                onChange={(e) => {
                  onAssignedUnitChange(e.target.value);
                  onShowToast(`Scope unit diubah ke ${e.target.value}`, 'info');
                }}
                className="w-full bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#2D7D62]"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    Unit: {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-2.5 bg-white border border-[#e2e6e4] rounded-lg text-[11px]">
            {userRole === 'Admin' ? (
              <span className="text-[#2D7D62] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D7D62] shrink-0" />
                Sebagai Admin Utama, Anda memiliki wewenang penuh mengelola aset seluruh unit kerja.
              </span>
            ) : (
              <span className="text-amber-800 font-semibold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Akses terbatas: Hanya menampilkan aset untuk unit <strong>{assignedUnit}</strong>.
              </span>
            )}
          </div>
        </div>
      )}

      {/* ASPECT TAB 3: INTEGRASI GOOGLE SHEET (GAS) */}
      {activeAspectTab === 'gas' && (
        <div className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl p-3.5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
              <Link className="w-4 h-4 text-[#2D7D62]" /> Integrasi Google Spreadsheet API (`Code.gs`)
            </h3>

            <button
              type="button"
              onClick={onOpenGasModal}
              className="flex items-center gap-1 text-[11px] text-[#2D7D62] hover:underline font-bold"
            >
              <Code2 className="w-3.5 h-3.5" /> Script Code.gs
            </button>
          </div>

          <div className={`p-2.5 rounded-lg border text-[11px] flex items-center justify-between ${
            isConnected
              ? 'bg-emerald-50/80 border-emerald-200 text-[#2D7D62]'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span className="font-bold flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              Status: {isConnected ? 'Tersambung ke Google Sheet' : 'Belum Tersambung (Mode Mock Lokal)'}
            </span>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#2D7D62]' : 'bg-amber-500 animate-pulse'}`} />
          </div>

          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <label className="text-[10px] text-[#7F8C8D] font-semibold block">URL Web App Apps Script (Deployment URL)</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 bg-white border border-[#e2e6e4] text-[#2C3E50] rounded-lg px-3 py-1.5 text-[11px] focus:outline-none focus:border-[#2D7D62] font-mono"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all shrink-0 cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ASPECT TAB 4: IMPOR/EKSPOR EXCEL & ALAT SISTEM */}
      {activeAspectTab === 'tools' && (
        <div className="space-y-3">
          {/* Excel Utilitas Card */}
          <div className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl p-3.5 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-[#2D7D62]" /> Impor & Ekspor Excel (.xlsx)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={downloadExcelTemplate}
                className="p-2.5 bg-white hover:bg-emerald-50 border border-[#e2e6e4] rounded-lg text-left transition-all flex items-start gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#2D7D62] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2C3E50] text-[11px] block font-bold">Template Excel</strong>
                  <span className="text-[9px] text-[#7F8C8D]">Format file .xlsx resmi</span>
                </div>
              </button>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="settingsExcelUpload"
                />
                <label
                  htmlFor="settingsExcelUpload"
                  className="p-2.5 bg-white hover:bg-emerald-50 border border-[#e2e6e4] rounded-lg text-left transition-all flex items-start gap-2 cursor-pointer block"
                >
                  <Upload className="w-4 h-4 text-[#2D7D62] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#2C3E50] text-[11px] block font-bold">Impor File Excel</strong>
                    <span className="text-[9px] text-[#7F8C8D]">Upload otomatis data aset</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                exportAuditReportToExcel(assets, sessions);
                onShowToast('Laporan seluruh aset berhasil diekspor ke Excel!', 'success');
              }}
              className="w-full py-2 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Ekspor Seluruh Laporan Aset (.xlsx)
            </button>

            {uploadStatus && (
              <div className="p-2 bg-[#A8E6CF]/40 border border-[#2D7D62]/30 text-[#2D7D62] text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D7D62] shrink-0" /> {uploadStatus}
              </div>
            )}
          </div>

          {/* Kalkulasi Penyusutan Periodik */}
          <div className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl p-3.5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCcw className="w-3.5 h-3.5 text-[#2D7D62]" /> Hitung Penyusutan Nilai Buku
              </h3>
              <span className="text-[9px] bg-emerald-100 text-[#2D7D62] font-bold px-1.5 py-0.2 rounded">
                Periodik
              </span>
            </div>

            <p className="text-[10px] text-[#7F8C8D] leading-relaxed">
              Proses kalkulasi penyusutan periodik (garis lurus) untuk seluruh aset aktif.
            </p>

            <button
              type="button"
              onClick={onRunDepreciationBatch}
              className="w-full py-2 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Hitung Penyusutan Bulanan / Periodik
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl p-3.5 space-y-2 shadow-2xs">
            <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCcw className="w-3.5 h-3.5 text-rose-600" /> Pemulihan Sistem
            </h3>

            <div className="flex items-center justify-between p-2.5 bg-white border border-[#e2e6e4] rounded-lg">
              <div>
                <strong className="text-[#2C3E50] text-[11px] block font-bold">Reset Data Demo</strong>
                <span className="text-[9px] text-[#7F8C8D]">Kembalikan ke kondisi awal</span>
              </div>
              <button
                type="button"
                onClick={onResetDemo}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition-all shrink-0 cursor-pointer"
              >
                Reset Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
