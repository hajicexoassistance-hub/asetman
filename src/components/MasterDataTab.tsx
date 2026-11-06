import React, { useState } from 'react';
import { Database, Plus, Trash2, Edit2, CheckCircle2, ShieldCheck, Building2, Users, Tag, Layers } from 'lucide-react';

interface MasterDataTabProps {
  categories: string[];
  units: string[];
  onAddCategory: (cat: string) => void;
  onAddUnit: (unit: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  hideHeader?: boolean;
}

export const MasterDataTab: React.FC<MasterDataTabProps> = ({
  categories,
  units,
  onAddCategory,
  onAddUnit,
  onShowToast,
  hideHeader = true,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'kategori' | 'jenis' | 'cabang' | 'unit' | 'karyawan' | 'vendor' | 'kondisi'>('kategori');

  // Local state for master entities with persistence
  const [localCategories, setLocalCategories] = useState<string[]>(
    categories.length > 0 ? categories : ['Elektronik & IT', 'Furniture Kantor', 'Kendaraan Operasional', 'Peralatan Medis', 'Mesin & Pabrik']
  );
  const [localJenis, setLocalJenis] = useState<string[]>(['Laptop Core i5', 'Printer Laser', 'Meja Biro', 'Kursi Ergonomis', 'Mobil Operasional']);
  const [localCabang, setLocalCabang] = useState<string[]>(['Cabang Pusat Jakarta', 'Cabang Surabaya', 'Cabang Medan', 'Cabang Bandung']);
  const [localUnits, setLocalUnits] = useState<string[]>(
    units.length > 0 ? units : ['HRD & General Affair', 'Departemen IT', 'Keuangan & Akuntansi', 'Operasional Pabrik', 'Marketing & Sales']
  );
  const [localKaryawan, setLocalKaryawan] = useState<Array<{ id: string; nama: string; jabatan: string; unit: string }>>([
    { id: 'EMP-001', nama: 'Budi Santoso, S.Kom', jabatan: 'IT Supervisor', unit: 'Departemen IT' },
    { id: 'EMP-002', nama: 'Siti Rahma, SE', jabatan: 'GA Staff', unit: 'HRD & General Affair' },
    { id: 'EMP-003', nama: 'Ahmad Fauzi', jabatan: 'Finance Manager', unit: 'Keuangan & Akuntansi' },
  ]);
  const [localVendors, setLocalVendors] = useState<Array<{ id: string; nama: string; kontak: string; kategori: string }>>([
    { id: 'VND-01', nama: 'PT Solusi Teknologi Nusantara', kontak: '021-5551234', kategori: 'Elektronik & IT' },
    { id: 'VND-02', nama: 'CV Furniture Indah Jaya', kontak: '022-7778899', kategori: 'Furniture Kantor' },
    { id: 'VND-03', nama: 'PT Astra Motor Fleet', kontak: '021-8889900', kategori: 'Kendaraan' },
  ]);
  const [localKondisi, setLocalKondisi] = useState<Array<{ status: string; deskripsi: string; warna: string }>>([
    { status: 'Baik', deskripsi: 'Aset berfungsi normal dan siap digunakan', warna: 'bg-emerald-100 text-emerald-800' },
    { status: 'Rusak Ringan', deskripsi: 'Perlu servis/perbaikan kecil', warna: 'bg-amber-100 text-amber-800' },
    { status: 'Rusak Berat', deskripsi: 'Tidak layak pakai, butuh tindakan afkir', warna: 'bg-rose-100 text-rose-800' },
    { status: 'Hilang', deskripsi: 'Aset tidak ditemukan saat stock opname', warna: 'bg-slate-100 text-slate-800' },
    { status: 'Musnah', deskripsi: 'Sudah dihapus / dimusnahkan resmi', warna: 'bg-purple-100 text-purple-800' },
  ]);

  // Input states for new item additions
  const [newItemText, setNewItemText] = useState('');
  const [newEmpNama, setNewEmpNama] = useState('');
  const [newEmpJabatan, setNewEmpJabatan] = useState('');
  const [newEmpUnit, setNewEmpUnit] = useState(localUnits[0] || 'Umum');
  const [newVndNama, setNewVndNama] = useState('');
  const [newVndKontak, setNewVndKontak] = useState('');
  const [newVndKat, setNewVndKat] = useState('Umum');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const val = newItemText.trim();

    if (activeSubTab === 'kategori') {
      if (!localCategories.includes(val)) {
        setLocalCategories((prev) => [...prev, val]);
        onAddCategory(val);
        onShowToast(`Kategori "${val}" berhasil ditambahkan!`, 'success');
      }
    } else if (activeSubTab === 'jenis') {
      if (!localJenis.includes(val)) {
        setLocalJenis((prev) => [...prev, val]);
        onShowToast(`Jenis Aset "${val}" berhasil ditambahkan!`, 'success');
      }
    } else if (activeSubTab === 'cabang') {
      if (!localCabang.includes(val)) {
        setLocalCabang((prev) => [...prev, val]);
        onShowToast(`Cabang "${val}" berhasil ditambahkan!`, 'success');
      }
    } else if (activeSubTab === 'unit') {
      if (!localUnits.includes(val)) {
        setLocalUnits((prev) => [...prev, val]);
        onAddUnit(val);
        onShowToast(`Unit Kerja "${val}" berhasil ditambahkan!`, 'success');
      }
    }
    setNewItemText('');
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpNama.trim()) return;
    const newEmp = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      nama: newEmpNama.trim(),
      jabatan: newEmpJabatan.trim() || 'Staf',
      unit: newEmpUnit,
    };
    setLocalKaryawan((prev) => [...prev, newEmp]);
    setNewEmpNama('');
    setNewEmpJabatan('');
    onShowToast(`Karyawan/PIC "${newEmp.nama}" berhasil ditambahkan!`, 'success');
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVndNama.trim()) return;
    const newV = {
      id: `VND-${Math.floor(10 + Math.random() * 90)}`,
      nama: newVndNama.trim(),
      kontak: newVndKontak.trim() || '-',
      kategori: newVndKat,
    };
    setLocalVendors((prev) => [...prev, newV]);
    setNewVndNama('');
    setNewVndKontak('');
    onShowToast(`Vendor "${newV.nama}" berhasil ditambahkan!`, 'success');
  };

  return (
    <div className="space-y-2.5 animate-in fade-in text-xs text-[#2C3E50]">
      {/* Title Header (Only if not hidden by parent) */}
      {!hideHeader && (
        <div className="px-0.5">
          <h2 className="text-sm font-bold text-[#2C3E50] tracking-tight flex items-center gap-1.5">
            <Database className="w-4 h-4 text-[#2D7D62]" />
            <span>Master Data & Manajemen Entitas</span>
          </h2>
          <p className="text-[10px] text-[#7F8C8D]">
            Pengelolaan CRUD Kategori, Jenis, Cabang, Unit, Karyawan, Vendor, & Status Kondisi
          </p>
        </div>
      )}

      {/* Sub-Tab Selector Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar bg-[#F2F4F3] p-1.5 rounded-xl border border-[#e2e6e4]">
        {[
          { key: 'kategori', label: 'Kategori', icon: Tag, count: localCategories.length },
          { key: 'jenis', label: 'Jenis Aset', icon: Layers, count: localJenis.length },
          { key: 'cabang', label: 'Cabang', icon: Building2, count: localCabang.length },
          { key: 'unit', label: 'Unit Kerja', icon: Building2, count: localUnits.length },
          { key: 'karyawan', label: 'Karyawan', icon: Users, count: localKaryawan.length },
          { key: 'vendor', label: 'Vendor', icon: ShieldCheck, count: localVendors.length },
          { key: 'kondisi', label: 'Kondisi', icon: CheckCircle2, count: localKondisi.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSubTab(tab.key as any)}
              className={`px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1 text-[11px] cursor-pointer ${
                isActive
                  ? 'bg-[#2D7D62] text-white shadow-2xs'
                  : 'bg-white text-[#2C3E50] hover:bg-slate-50 border border-[#e2e6e4]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-[#F2F4F3] text-[#7F8C8D]'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Panel for Active Sub-Tab */}
      <div className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl p-4 space-y-4 shadow-xs">
        {/* 1 & 2 & 3 & 4. Simple List (Kategori, Jenis, Cabang, Unit) */}
        {['kategori', 'jenis', 'cabang', 'unit'].includes(activeSubTab) && (
          <div className="space-y-4">
            <form onSubmit={handleAddItem} className="flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder={`Tambah ${activeSubTab} baru...`}
                className="flex-1 bg-white border border-[#e2e6e4] text-[#2C3E50] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2D7D62]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(activeSubTab === 'kategori'
                ? localCategories
                : activeSubTab === 'jenis'
                ? localJenis
                : activeSubTab === 'cabang'
                ? localCabang
                : localUnits
              ).map((item, idx) => (
                <div
                  key={`master-${activeSubTab}-${idx}`}
                  className="bg-white border border-[#e2e6e4] rounded-xl p-3 flex items-center justify-between shadow-2xs"
                >
                  <span className="font-semibold text-[#2C3E50] text-xs">{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSubTab === 'kategori') {
                        setLocalCategories((prev) => prev.filter((_, i) => i !== idx));
                      } else if (activeSubTab === 'jenis') {
                        setLocalJenis((prev) => prev.filter((_, i) => i !== idx));
                      } else if (activeSubTab === 'cabang') {
                        setLocalCabang((prev) => prev.filter((_, i) => i !== idx));
                      } else {
                        setLocalUnits((prev) => prev.filter((_, i) => i !== idx));
                      }
                      onShowToast(`Item berhasil dihapus dari Master ${activeSubTab}.`, 'info');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Karyawan / PIC CRUD */}
        {activeSubTab === 'karyawan' && (
          <div className="space-y-4">
            <form onSubmit={handleAddEmployee} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={newEmpNama}
                onChange={(e) => setNewEmpNama(e.target.value)}
                placeholder="Nama Lengkap & Gelar..."
                className="bg-white border border-[#e2e6e4] text-[#2C3E50] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2D7D62]"
              />
              <input
                type="text"
                value={newEmpJabatan}
                onChange={(e) => setNewEmpJabatan(e.target.value)}
                placeholder="Jabatan / Role..."
                className="bg-white border border-[#e2e6e4] text-[#2C3E50] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2D7D62]"
              />
              <select
                value={newEmpUnit}
                onChange={(e) => setNewEmpUnit(e.target.value)}
                className="bg-white border border-[#e2e6e4] text-[#2C3E50] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2D7D62]"
              >
                {localUnits.map((u) => (
                  <option key={`emp-u-${u}`} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-xs rounded-xl py-2 flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Simpan PIC
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {localKaryawan.map((emp, idx) => (
                <div key={emp.id} className="bg-white border border-[#e2e6e4] rounded-xl p-3 flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#2D7D62] text-[11px]">{emp.id}</span>
                      <span className="font-bold text-[#2C3E50] text-xs">{emp.nama}</span>
                    </div>
                    <p className="text-[10px] text-[#7F8C8D] mt-0.5">
                      {emp.jabatan} · Unit: {emp.unit}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalKaryawan((prev) => prev.filter((_, i) => i !== idx));
                      onShowToast('Karyawan berhasil dihapus.', 'info');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Vendor / Supplier CRUD */}
        {activeSubTab === 'vendor' && (
          <div className="space-y-4">
            <form onSubmit={handleAddVendor} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={newVndNama}
                onChange={(e) => setNewVndNama(e.target.value)}
                placeholder="Nama Vendor / Supplier..."
                className="bg-white border border-[#e2e6e4] text-[#2C3E50] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2D7D62]"
              />
              <input
                type="text"
                value={newVndKontak}
                onChange={(e) => setNewVndKontak(e.target.value)}
                placeholder="No. Telepon / Kontak..."
                className="bg-white border border-[#e2e6e4] text-[#2C3E50] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2D7D62]"
              />
              <select
                value={newVndKat}
                onChange={(e) => setNewVndKat(e.target.value)}
                className="bg-white border border-[#e2e6e4] text-[#2C3E50] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2D7D62]"
              >
                {localCategories.map((c) => (
                  <option key={`vnd-c-${c}`} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-xs rounded-xl py-2 flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Vendor
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {localVendors.map((vnd, idx) => (
                <div key={vnd.id} className="bg-white border border-[#e2e6e4] rounded-xl p-3 flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#2D7D62] text-[11px]">{vnd.id}</span>
                      <span className="font-bold text-[#2C3E50] text-xs">{vnd.nama}</span>
                    </div>
                    <p className="text-[10px] text-[#7F8C8D] mt-0.5">
                      Kontak: {vnd.kontak} · Bidang: {vnd.kategori}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalVendors((prev) => prev.filter((_, i) => i !== idx));
                      onShowToast('Vendor berhasil dihapus.', 'info');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Status Kondisi */}
        {activeSubTab === 'kondisi' && (
          <div className="space-y-2">
            {localKondisi.map((kond, idx) => (
              <div key={`kond-${idx}`} className="bg-white border border-[#e2e6e4] rounded-xl p-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${kond.warna}`}>
                    {kond.status}
                  </span>
                  <span className="text-xs text-[#7F8C8D]">{kond.deskripsi}</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md">
                  Aktif Sistem
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
