import React, { useState, useEffect } from 'react';
import { Asset, PosActionMode, ConditionType, UserRole } from '../types';
import { AssetCartPanel } from './AssetCartPanel';
import { BottomSheet } from './BottomSheet';
import { generateQrCodeSvg } from '../utils/barcodeUtils';
import {
  Search,
  Volume2,
  VolumeX,
  Camera,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  ArrowLeftRight,
  FileCheck2,
  Trash2,
  Printer,
  Plus,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';

export function playBeepSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, ctx.currentTime); // 1760 Hz High Beep
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Audio Context fail silent fallback
  }
}

interface AssetPosTabProps {
  assets: Asset[];
  categories: string[];
  units: string[];
  employees: Array<{ id: string; nama: string; jabatan: string; unit: string }>;
  vendors: Array<{ id: string; nama: string; kontak: string; kategori: string }>;
  onAddEmployee: (name: string) => void;
  onAddVendor: (name: string) => void;
  userRole: UserRole;
  assignedUnit: string;
  activeAuditor: string;
  onExecuteTransaction: (payload: {
    mode: PosActionMode;
    cartItems: Asset[];
    formData: any;
  }) => Promise<void>;
  isProcessing: boolean;
  onOpenScanner: () => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const AssetPosTab: React.FC<AssetPosTabProps> = ({
  assets,
  categories,
  units,
  employees,
  vendors,
  onAddEmployee,
  onAddVendor,
  userRole,
  assignedUnit,
  activeAuditor,
  onExecuteTransaction,
  isProcessing,
  onOpenScanner,
  onShowToast,
}) => {
  const [activeMode, setActiveMode] = useState<PosActionMode>('pinjam');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('Semua');
  const [selectedCatFilter, setSelectedCatFilter] = useState('Semua');

  // Scanner State
  const [isContinuousScan, setIsContinuousScan] = useState(true);
  const [cartItems, setCartItems] = useState<Asset[]>([]);
  const [isMobileCartSheetOpen, setIsMobileCartSheetOpen] = useState(false);

  // Auto-filter assets according to active mode validation rules
  const scopedAssets = assets.filter((a) => {
    if (userRole !== 'Admin' && a.Unit_Kerja.toLowerCase().trim() !== assignedUnit.toLowerCase().trim()) {
      return false;
    }
    return true;
  });

  const filteredAssets = scopedAssets.filter((a) => {
    // Mode specific state validation guard
    if (activeMode === 'pinjam') {
      if (a.Status_Pinjam === 'Dipinjam') return false;
    } else if (activeMode === 'kembali') {
      if (a.Status_Pinjam !== 'Dipinjam') return false;
    } else if (activeMode === 'hapus') {
      // Prioritize severely damaged or musnah items
      if (a.Kondisi === 'Baik') return false;
    }

    if (selectedUnitFilter !== 'Semua' && a.Unit_Kerja !== selectedUnitFilter) return false;
    if (selectedCatFilter !== 'Semua' && a.Kategori !== selectedCatFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        a.ID_Asset.toLowerCase().includes(q) ||
        a.Nama_Asset.toLowerCase().includes(q) ||
        a.Penanggung_Jawab.toLowerCase().includes(q) ||
        (a.Nomor_Seri && a.Nomor_Seri.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleWrapperExecuteTransaction = async (payload: {
    mode: PosActionMode;
    cartItems: Asset[];
    formData: any;
  }) => {
    await onExecuteTransaction(payload);
    setCartItems([]);
    setIsMobileCartSheetOpen(false);
  };

  const handleAddToCart = (asset: Asset) => {
    if (cartItems.some((item) => item.ID_Asset === asset.ID_Asset)) {
      setCartItems((prev) => prev.filter((item) => item.ID_Asset !== asset.ID_Asset));
      return;
    }

    // Validation Guard check
    if (activeMode === 'pinjam' && asset.Status_Pinjam === 'Dipinjam') {
      onShowToast(`Aset ${asset.ID_Asset} sedang DIPINJAM oleh ${asset.Peminjam_Aktif || 'lain'}!`, 'error');
      return;
    }

    if (isContinuousScan) {
      playBeepSound();
    }

    setCartItems((prev) => [...prev, asset]);
  };

  const handleRemoveFromCart = (assetId: string) => {
    setCartItems((prev) => prev.filter((item) => item.ID_Asset !== assetId));
  };

  const handleUpdateCartItemCondition = (assetId: string, condition: ConditionType, note?: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.ID_Asset === assetId
          ? { ...item, Kondisi: condition, Catatan_Khusus_Item: note }
          : item
      )
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = filteredAssets.find(
      (a) => a.ID_Asset.toLowerCase().trim() === searchQuery.toLowerCase().trim()
    );

    if (matched) {
      handleAddToCart(matched);
      setSearchQuery('');
    }
  };

  return (
    <div className="space-y-2.5 pb-4 pt-1 animate-in fade-in text-xs text-[#2C3E50]">
      {/* 1. Zona Atas: Action Mode Switcher (Horizontal Scroll Pills) */}
      <div className="bg-[#F2F4F3] p-1.5 rounded-xl border border-[#e2e6e4] space-y-1">
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {[
            { key: 'pinjam', label: '1. Pinjam', icon: ArrowLeftRight },
            { key: 'kembali', label: '2. Kembali', icon: CheckCircle2 },
            { key: 'bast_terima', label: '3. BAST Terima', icon: FileCheck2 },
            { key: 'mutasi', label: '4. Mutasi', icon: Building2 },
            { key: 'hapus', label: '5. Afkir / Hapus', icon: Trash2 },
            { key: 'input_baru', label: '6. Input Baru', icon: Plus },
            { key: 'cetak_label', label: '7. Cetak Label', icon: Printer },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.key;
            return (
              <button
                key={mode.key}
                type="button"
                onClick={() => {
                  setActiveMode(mode.key as PosActionMode);
                  setCartItems([]);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1 text-[11px] cursor-pointer ${
                  isActive
                    ? 'bg-[#2D7D62] text-white shadow-2xs'
                    : 'bg-white text-[#2C3E50] hover:bg-slate-50 border border-[#e2e6e4]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Zona Omni-Search & Continuous Scanner Bar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#7F8C8D] absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Scan / Ketik Tag ID, S/N, Nama Aset..."
            className="w-full bg-white border border-[#e2e6e4] rounded-lg pl-8 pr-2 py-1.5 text-[11px] text-[#2C3E50] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#2D7D62] shadow-2xs"
          />
        </div>

        {/* Audio Beep Toggle */}
        <button
          type="button"
          onClick={() => setIsContinuousScan(!isContinuousScan)}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isContinuousScan
              ? 'bg-emerald-50 border-emerald-200 text-[#2D7D62]'
              : 'bg-[#F2F4F3] border-[#e2e6e4] text-[#7F8C8D]'
          }`}
          title={isContinuousScan ? 'Beep Audio AKTIF' : 'Beep Audio MATI'}
        >
          {isContinuousScan ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Camera Scanner Launcher */}
        <button
          type="button"
          onClick={onOpenScanner}
          className="p-2 bg-[#2D7D62] hover:bg-[#23634e] text-white rounded-lg shadow-2xs transition-all cursor-pointer"
          title="Kamera Scanner"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Main Split Screen Area (Desktop 60/40 Split, Mobile Stack) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* ZONA KIRI (60% Desktop): Catalog Grid */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#2C3E50]">
              <span>Katalog ({filteredAssets.length})</span>
            </div>

            {/* Micro Filters */}
            <div className="flex items-center gap-1 text-[11px]">
              <select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                className="bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-lg px-2 py-1 text-[11px] focus:outline-none"
              >
                {['Semua Kategori', ...Array.from(new Set(categories.filter((c) => c && c.trim() !== 'Semua')))].map((c) => (
                  <option key={`fcat-${c}`} value={c === 'Semua Kategori' ? 'Semua' : c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Catalog Cards Grid */}
          <div className="space-y-1.5 overflow-y-auto pr-1">
            {filteredAssets.length === 0 ? (
              <div className="p-6 text-center bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl text-[#7F8C8D] text-xs">
                Tidak ada aset untuk mode <strong>{activeMode}</strong>.
              </div>
            ) : (
              filteredAssets.map((asset) => {
                const isSelected = cartItems.some((item) => item.ID_Asset === asset.ID_Asset);
                const qrSvg = generateQrCodeSvg(asset.ID_Asset, 32);

                return (
                  <div
                    key={`pos-card-${asset.ID_Asset}`}
                    onClick={() => handleAddToCart(asset)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-[#2D7D62] ring-1 ring-[#2D7D62]/30 bg-emerald-50/70 shadow-2xs'
                        : 'bg-white border-[#e2e6e4] hover:border-[#2D7D62]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(asset);
                        }}
                        className="text-[#2D7D62] cursor-pointer shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#2D7D62]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>

                      {asset.Foto_Asset ? (
                        <img
                          src={asset.Foto_Asset}
                          alt={asset.Nama_Asset}
                          className="w-8 h-8 rounded-lg object-cover border border-[#e2e6e4] shrink-0"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#e2e6e4] p-0.5 shrink-0 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: qrSvg }}
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-[#2D7D62] text-[10px]">
                            {asset.ID_Asset}
                          </span>
                          <span
                            className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                              asset.Kondisi === 'Baik'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {asset.Kondisi}
                          </span>
                        </div>
                        <h4 className="font-bold text-[#2C3E50] text-[11px] truncate leading-tight">
                          {asset.Nama_Asset}
                        </h4>
                        <p className="text-[9px] text-[#7F8C8D] truncate">
                          {asset.Kategori} · {asset.Unit_Kerja}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-2 py-1 rounded-lg font-bold text-[10px] shrink-0 transition-all ${
                        isSelected
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-[#2D7D62] text-white hover:bg-[#23634e]'
                      }`}
                    >
                      {isSelected ? 'Batal' : '+ Pilih'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ZONA KANAN (40% Desktop): Execution Cart Panel */}
        <div className="hidden lg:block lg:col-span-5 sticky top-16">
          <AssetCartPanel
            activeMode={activeMode}
            cartItems={cartItems}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={() => setCartItems([])}
            onUpdateCartItemCondition={handleUpdateCartItemCondition}
            units={units}
            categories={categories}
            employees={employees}
            vendors={vendors}
            onAddEmployee={onAddEmployee}
            onAddVendor={onAddVendor}
            activeAuditor={activeAuditor}
            onExecuteTransaction={handleWrapperExecuteTransaction}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* MOBILE STICKY FLOATING BOTTOM BAR (When Cart Has Items) */}
      {(cartItems.length > 0 || activeMode === 'input_baru') && (
        <div className="lg:hidden fixed bottom-16 left-4 right-4 z-30 bg-[#2C3E50] text-white rounded-2xl p-3 shadow-2xl border border-[#2D7D62] flex items-center justify-between animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2 pl-1">
            <span className="w-6 h-6 rounded-full bg-[#A8E6CF] text-[#2D7D62] text-xs font-black flex items-center justify-center font-mono">
              {cartItems.length}
            </span>
            <span className="text-xs font-bold text-white">Item di Keranjang</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileCartSheetOpen(true)}
            className="px-4 py-2 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Proses Transaksi ▲</span>
          </button>
        </div>
      )}

      {/* MOBILE SLIDE-UP BOTTOM SHEET */}
      <BottomSheet
        isOpen={isMobileCartSheetOpen}
        onClose={() => setIsMobileCartSheetOpen(false)}
        title="Panel Eksekusi Transaksi POS"
        subtitle={`Mode: ${activeMode.toUpperCase()} (${cartItems.length} Item)`}
        maxHeightClass="max-h-[92vh]"
      >
        <AssetCartPanel
          activeMode={activeMode}
          cartItems={cartItems}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={() => setCartItems([])}
          onUpdateCartItemCondition={handleUpdateCartItemCondition}
          units={units}
          categories={categories}
          employees={employees}
          vendors={vendors}
          onAddEmployee={onAddEmployee}
          onAddVendor={onAddVendor}
          activeAuditor={activeAuditor}
          onExecuteTransaction={handleWrapperExecuteTransaction}
          isProcessing={isProcessing}
        />
      </BottomSheet>
    </div>
  );
};
