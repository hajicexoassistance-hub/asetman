import React, { useState, useEffect } from 'react';
import { Asset, ConditionType, PosActionMode, BeritaAcaraDoc, AssetLoan } from '../types';
import { SignatureCanvas } from './SignatureCanvas';
import { SearchableSelectWithAdd } from './SearchableSelectWithAdd';
import {
  X,
  Trash2,
  CheckCircle2,
  Printer,
  FileCheck2,
  ArrowLeftRight,
  User,
  Building2,
  Calendar,
  AlertTriangle,
  Sparkles,
  Layers,
  FileText,
} from 'lucide-react';

interface AssetCartPanelProps {
  activeMode: PosActionMode;
  cartItems: Asset[];
  onRemoveFromCart: (assetId: string) => void;
  onClearCart: () => void;
  onUpdateCartItemCondition: (assetId: string, condition: ConditionType, note?: string) => void;
  units: string[];
  categories: string[];
  employees: Array<{ id: string; nama: string; jabatan: string; unit: string }>;
  vendors: Array<{ id: string; nama: string; kontak: string; kategori: string }>;
  onAddEmployee: (name: string) => void;
  onAddVendor: (name: string) => void;
  activeAuditor: string;
  onExecuteTransaction: (payload: {
    mode: PosActionMode;
    cartItems: Asset[];
    formData: any;
  }) => Promise<void>;
  isProcessing: boolean;
}

export const AssetCartPanel: React.FC<AssetCartPanelProps> = ({
  activeMode,
  cartItems,
  onRemoveFromCart,
  onClearCart,
  onUpdateCartItemCondition,
  units,
  categories,
  employees,
  vendors,
  onAddEmployee,
  onAddVendor,
  activeAuditor,
  onExecuteTransaction,
  isProcessing,
}) => {
  // Form State according to activeMode
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerUnit, setBorrowerUnit] = useState(units[0] || 'Office');
  const [targetReturnDate, setTargetReturnDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10)
  );
  const [loanPurpose, setLoanPurpose] = useState('');

  const [pihak1Nama, setPihak1Nama] = useState(activeAuditor);
  const [pihak1Jabatan, setPihak1Jabatan] = useState('Petugas / Admin Aset');
  const [pihak1TTD, setPihak1TTD] = useState('');

  const [pihak2Nama, setPihak2Nama] = useState('');
  const [pihak2Jabatan, setPihak2Jabatan] = useState('');
  const [pihak2TTD, setPihak2TTD] = useState('');

  const [targetUnitMutasi, setTargetUnitMutasi] = useState(units[0] || 'Office');
  const [newPicMutasi, setNewPicMutasi] = useState('');
  const [alasanMutasi, setAlasanMutasi] = useState('');

  const [disposalReason, setDisposalReason] = useState('Rusak Berat Tidak Ekonomis');
  const [witnessName, setWitnessName] = useState('');

  const [labelFormat, setLabelFormat] = useState<'thermal_single' | 'a4_grid'>('thermal_single');
  const [includeQR, setIncludeQR] = useState(true);

  // Input Baru Form
  const [newNamaAsset, setNewNamaAsset] = useState('');
  const [newKategori, setNewKategori] = useState(categories[0] || 'IT & Elektronik');
  const [newUnitKerja, setNewUnitKerja] = useState(units[0] || 'Office');
  const [newPic, setNewPic] = useState('Admin Master');
  const [newQty, setNewQty] = useState<number>(1);
  const [newHarga, setNewHarga] = useState<number | ''>('');
  const [newMasaManfaat, setNewMasaManfaat] = useState<number>(4);

  useEffect(() => {
    setPihak1Nama(activeAuditor);
  }, [activeAuditor]);

  const employeeOptions = employees.map((e) => ({
    label: e.nama,
    subLabel: `${e.jabatan} · ${e.unit}`,
  }));

  const vendorOptions = vendors.map((v) => ({
    label: v.nama,
    subLabel: `Kontak: ${v.kontak} · ${v.kategori}`,
  }));

  const unitOptions = units.map((u) => ({
    label: u,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeMode !== 'input_baru' && cartItems.length === 0) return;

    let formData: any = {};
    if (activeMode === 'pinjam') {
      if (!borrowerName.trim()) return;
      formData = {
        borrowerName: borrowerName.trim(),
        borrowerUnit,
        targetReturnDate,
        loanPurpose: loanPurpose.trim(),
        signature: pihak2TTD || pihak1TTD,
      };
    } else if (activeMode === 'kembali') {
      formData = {
        verifierName: activeAuditor,
      };
    } else if (activeMode === 'bast_terima') {
      if (!pihak2Nama.trim()) return;
      formData = {
        pihak1Nama,
        pihak1Jabatan,
        pihak1TTD,
        pihak2Nama: pihak2Nama.trim(),
        pihak2Jabatan,
        pihak2TTD,
        poNumber: `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      };
    } else if (activeMode === 'mutasi') {
      if (!targetUnitMutasi || !newPicMutasi.trim()) return;
      formData = {
        targetUnitMutasi,
        newPicMutasi: newPicMutasi.trim(),
        alasanMutasi: alasanMutasi.trim(),
        pihak1Nama,
        pihak1TTD,
        pihak2Nama: newPicMutasi.trim(),
        pihak2TTD,
      };
    } else if (activeMode === 'hapus') {
      formData = {
        disposalReason,
        witnessName: witnessName.trim(),
        pihak1Nama,
        pihak1TTD,
        pihak2Nama: witnessName.trim() || 'Saksi Otorisasi',
        pihak2TTD,
      };
    } else if (activeMode === 'cetak_label') {
      formData = {
        labelFormat,
        includeQR,
      };
    } else if (activeMode === 'input_baru') {
      if (!newNamaAsset.trim()) return;
      formData = {
        namaAsset: newNamaAsset.trim(),
        kategori: newKategori,
        unitKerja: newUnitKerja,
        pic: newPic.trim() || 'Admin Master',
        qty: Number(newQty) || 1,
        hargaPerolehan: newHarga ? Number(newHarga) : undefined,
        masaManfaat: Number(newMasaManfaat) || 4,
      };
    }

    onExecuteTransaction({
      mode: activeMode,
      cartItems,
      formData,
    });
  };

  return (
    <div className="space-y-4 text-xs text-[#2C3E50]">
      {/* Header Panel Keranjang */}
      <div className="flex items-center justify-between bg-[#F2F4F3] border border-[#e2e6e4] p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#2D7D62] text-white text-xs font-bold flex items-center justify-center font-mono">
            {activeMode === 'input_baru' ? newQty : cartItems.length}
          </span>
          <div>
            <h3 className="font-bold text-[#2C3E50] text-xs">
              {activeMode === 'pinjam' && 'Keranjang Peminjaman'}
              {activeMode === 'kembali' && 'Keranjang Pengembalian'}
              {activeMode === 'bast_terima' && 'Keranjang BAST Penerimaan'}
              {activeMode === 'mutasi' && 'Keranjang Mutasi Unit'}
              {activeMode === 'hapus' && 'Keranjang Penghapusan / Afkir'}
              {activeMode === 'cetak_label' && 'Antrean Cetak Label'}
              {activeMode === 'input_baru' && 'Antrean Input Aset Baru'}
            </h3>
            <span className="text-[10px] text-[#7F8C8D]">
              {activeMode === 'input_baru' ? 'Preview batch item sebelum disimpan' : 'Pilih item dari katalog'}
            </span>
          </div>
        </div>

        {cartItems.length > 0 && activeMode !== 'input_baru' && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      {/* Mode 8: Input Baru Form */}
      {activeMode === 'input_baru' ? (
        <div className="space-y-3 bg-white p-3.5 border border-[#e2e6e4] rounded-2xl shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D7D62] mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Form Registrasi Aset Baru</span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#7F8C8D] block mb-1">Nama Barang / Aset</label>
            <input
              type="text"
              required
              value={newNamaAsset}
              onChange={(e) => setNewNamaAsset(e.target.value)}
              placeholder="Contoh: Laptop ThinkPad T14 Gen 5"
              className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <SearchableSelectWithAdd
                label="Kategori"
                options={categories.map((c) => ({ label: c }))}
                value={newKategori}
                onChange={(val) => setNewKategori(val)}
                onAddNew={(newCat) => {
                  setNewKategori(newCat);
                }}
              />
            </div>

            <div>
              <SearchableSelectWithAdd
                label="Unit Kerja"
                options={unitOptions}
                value={newUnitKerja}
                onChange={(val) => setNewUnitKerja(val)}
                onAddNew={(newU) => {
                  setNewUnitKerja(newU);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-[#7F8C8D] block mb-1">Jumlah (Qty)</label>
              <input
                type="number"
                min={1}
                value={newQty}
                onChange={(e) => setNewQty(Number(e.target.value))}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-2.5 py-1.5 text-[#2C3E50] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#7F8C8D] block mb-1">Harga Beli (Rp)</label>
              <input
                type="number"
                placeholder="15000000"
                value={newHarga}
                onChange={(e) => setNewHarga(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-2.5 py-1.5 text-[#2C3E50] font-mono focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#7F8C8D] block mb-1">Masa Manfaat</label>
              <input
                type="number"
                min={1}
                value={newMasaManfaat}
                onChange={(e) => setNewMasaManfaat(Number(e.target.value))}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-2.5 py-1.5 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
          </div>

          {newQty > 1 && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-[#2D7D62] rounded-xl text-[11px] font-mono">
              ✓ Batch Auto-Generate: {newQty} Unit Nomor Tag berurutan akan dibuat otomatis!
            </div>
          )}
        </div>
      ) : (
        /* Cart Items List */
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {cartItems.length === 0 ? (
            <div className="p-6 text-center bg-[#F2F4F3] border border-dashed border-[#e2e6e4] rounded-2xl text-[#7F8C8D]">
              Keranjang kosong. Pilih atau scan barang dari katalog di samping kiri.
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div
                key={`cart-${item.ID_Asset}-${idx}`}
                className="p-3 bg-white border border-[#e2e6e4] rounded-2xl shadow-2xs space-y-2 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono font-bold text-[#2D7D62] text-[11px] block">{item.ID_Asset}</span>
                    <h4 className="font-bold text-[#2C3E50] truncate">{item.Nama_Asset}</h4>
                    <p className="text-[10px] text-[#7F8C8D]">
                      {item.Kategori} · {item.Unit_Kerja}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveFromCart(item.ID_Asset)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {(activeMode === 'kembali' || activeMode === 'hapus') && (
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-[#F2F4F3]">
                    <div>
                      <label className="text-[10px] text-[#7F8C8D] font-semibold block mb-0.5">Kondisi</label>
                      <select
                        value={item.Kondisi || 'Baik'}
                        onChange={(e) =>
                          onUpdateCartItemCondition(item.ID_Asset, e.target.value as ConditionType, item.Catatan_Khusus_Item)
                        }
                        className="w-full bg-[#F2F4F3] border border-[#e2e6e4] rounded-lg px-2 py-1 text-[11px] text-[#2C3E50] font-semibold"
                      >
                        <option value="Baik">Baik</option>
                        <option value="Rusak Ringan">Rusak Ringan</option>
                        <option value="Rusak Berat">Rusak Berat</option>
                        <option value="Musnah">Musnah</option>
                        <option value="Hilang">Hilang</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#7F8C8D] font-semibold block mb-0.5">Catatan Item</label>
                      <input
                        type="text"
                        placeholder="Keterangan..."
                        value={item.Catatan_Khusus_Item || ''}
                        onChange={(e) => onUpdateCartItemCondition(item.ID_Asset, item.Kondisi, e.target.value)}
                        className="w-full bg-[#F2F4F3] border border-[#e2e6e4] rounded-lg px-2 py-1 text-[11px] text-[#2C3E50]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Dynamic Contextual Form Engine */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-[#e2e6e4]">
        {/* MODE 1: PINJAM */}
        {activeMode === 'pinjam' && (
          <div className="space-y-3 bg-white p-3.5 border border-[#e2e6e4] rounded-2xl">
            <h4 className="font-bold text-[#2C3E50] text-xs uppercase tracking-wider">Form Peminjam Aset</h4>

            <div className="grid grid-cols-2 gap-2">
              <SearchableSelectWithAdd
                label="Nama Peminjam"
                options={employeeOptions}
                value={borrowerName}
                onChange={(val) => setBorrowerName(val)}
                onAddNew={(newEmp) => {
                  onAddEmployee(newEmp);
                  setBorrowerName(newEmp);
                }}
                required
              />

              <SearchableSelectWithAdd
                label="Unit Peminjam"
                options={unitOptions}
                value={borrowerUnit}
                onChange={(val) => setBorrowerUnit(val)}
                onAddNew={(newU) => setBorrowerUnit(newU)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-[#7F8C8D] block mb-1">Target Kembali</label>
                <input
                  type="date"
                  value={targetReturnDate}
                  onChange={(e) => setTargetReturnDate(e.target.value)}
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-2.5 py-1.5 text-[#2C3E50] text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#7F8C8D] block mb-1">Keperluan</label>
                <input
                  type="text"
                  placeholder="Dinas luar kota..."
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-2.5 py-1.5 text-[#2C3E50] text-xs"
                />
              </div>
            </div>

            <SignatureCanvas label="Tanda Tangan Peminjam" initialValue={pihak2TTD} onSave={(url) => setPihak2TTD(url)} />
          </div>
        )}

        {/* MODE 3: BAST TERIMA */}
        {activeMode === 'bast_terima' && (
          <div className="space-y-3 bg-white p-3.5 border border-[#e2e6e4] rounded-2xl">
            <h4 className="font-bold text-[#2C3E50] text-xs uppercase tracking-wider">Form BAST Penerimaan</h4>

            <div className="grid grid-cols-2 gap-2">
              <SearchableSelectWithAdd
                label="Pihak 1 (Vendor / Supplier)"
                options={vendorOptions}
                value={pihak1Nama}
                onChange={(val) => setPihak1Nama(val)}
                onAddNew={(newV) => {
                  onAddVendor(newV);
                  setPihak1Nama(newV);
                }}
              />

              <SearchableSelectWithAdd
                label="Pihak 2 (Penerima / PIC)"
                options={employeeOptions}
                value={pihak2Nama}
                onChange={(val) => setPihak2Nama(val)}
                onAddNew={(newE) => {
                  onAddEmployee(newE);
                  setPihak2Nama(newE);
                }}
                required
              />
            </div>

            <SignatureCanvas label="Tanda Tangan Pihak Penerima (Pihak 2)" initialValue={pihak2TTD} onSave={(url) => setPihak2TTD(url)} />
          </div>
        )}

        {/* MODE 4: MUTASI */}
        {activeMode === 'mutasi' && (
          <div className="space-y-3 bg-white p-3.5 border border-[#e2e6e4] rounded-2xl">
            <h4 className="font-bold text-[#2C3E50] text-xs uppercase tracking-wider">Form BA Mutasi Unit</h4>

            <div className="grid grid-cols-2 gap-2">
              <SearchableSelectWithAdd
                label="Unit Tujuan Baru"
                options={unitOptions}
                value={targetUnitMutasi}
                onChange={(val) => setTargetUnitMutasi(val)}
                onAddNew={(newU) => setTargetUnitMutasi(newU)}
              />

              <SearchableSelectWithAdd
                label="PIC Baru"
                options={employeeOptions}
                value={newPicMutasi}
                onChange={(val) => setNewPicMutasi(val)}
                onAddNew={(newE) => {
                  onAddEmployee(newE);
                  setNewPicMutasi(newE);
                }}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#7F8C8D] block mb-1">Alasan Mutasi</label>
              <input
                type="text"
                placeholder="Penataan ruang / alokasi proyek..."
                value={alasanMutasi}
                onChange={(e) => setAlasanMutasi(e.target.value)}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-2.5 py-1.5 text-[#2C3E50] text-xs"
              />
            </div>

            <SignatureCanvas label="Tanda Tangan Penerima Mutasi" initialValue={pihak2TTD} onSave={(url) => setPihak2TTD(url)} />
          </div>
        )}

        {/* MODE 5: HAPUS */}
        {activeMode === 'hapus' && (
          <div className="space-y-3 bg-white p-3.5 border border-[#e2e6e4] rounded-2xl">
            <h4 className="font-bold text-rose-700 text-xs uppercase tracking-wider">Form BA Penghapusan / Afkir</h4>

            <div>
              <label className="text-[10px] font-semibold text-[#7F8C8D] block mb-1">Alasan Pemusnahan / Afkir</label>
              <select
                value={disposalReason}
                onChange={(e) => setDisposalReason(e.target.value)}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-2.5 py-1.5 text-[#2C3E50] text-xs"
              >
                <option value="Rusak Berat Tidak Ekonomis">Rusak Berat Tidak Ekonomis</option>
                <option value="Hilang / Tidak Ditemukan">Hilang / Tidak Ditemukan</option>
                <option value="Musnah Terbakar / Bencana">Musnah Terbakar / Bencana</option>
                <option value="Usang (Outdated Technology)">Usang (Outdated Technology)</option>
              </select>
            </div>

            <SearchableSelectWithAdd
              label="Nama Saksi / Otorisasi"
              options={employeeOptions}
              value={witnessName}
              onChange={(val) => setWitnessName(val)}
              onAddNew={(newE) => {
                onAddEmployee(newE);
                setWitnessName(newE);
              }}
            />

            <SignatureCanvas label="Tanda Tangan Saksi Otorisasi" initialValue={pihak2TTD} onSave={(url) => setPihak2TTD(url)} />
          </div>
        )}

        {/* MODE 7: CETAK LABEL */}
        {activeMode === 'cetak_label' && (
          <div className="space-y-3 bg-white p-3.5 border border-[#e2e6e4] rounded-2xl">
            <h4 className="font-bold text-[#2C3E50] text-xs uppercase tracking-wider">Opsi Cetak Label Stiker</h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLabelFormat('thermal_single')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  labelFormat === 'thermal_single'
                    ? 'bg-emerald-50 border-[#2D7D62] text-[#2D7D62] font-bold'
                    : 'bg-[#F2F4F3] border-[#e2e6e4] text-[#7F8C8D]'
                }`}
              >
                <Printer className="w-4 h-4 mb-1" />
                <span className="block text-[11px]">Thermal Roll 50x30mm</span>
              </button>

              <button
                type="button"
                onClick={() => setLabelFormat('a4_grid')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  labelFormat === 'a4_grid'
                    ? 'bg-emerald-50 border-[#2D7D62] text-[#2D7D62] font-bold'
                    : 'bg-[#F2F4F3] border-[#e2e6e4] text-[#7F8C8D]'
                }`}
              >
                <Layers className="w-4 h-4 mb-1" />
                <span className="block text-[11px]">A4 Grid Sheet (3x8)</span>
              </button>
            </div>
          </div>
        )}

        {/* Primary CTA Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || (activeMode !== 'input_baru' && cartItems.length === 0)}
          className="w-full bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold py-3.5 rounded-2xl shadow-xs text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
        >
          <CheckCircle2 className="w-4.5 h-4.5" />
          <span>
            {isProcessing
              ? 'Memproses Transaksi...'
              : activeMode === 'pinjam'
              ? 'Proses Peminjaman & Cetak Slip'
              : activeMode === 'kembali'
              ? 'Proses Pengembalian Aset'
              : activeMode === 'bast_terima'
              ? 'Terbitkan BAST Penerimaan PDF'
              : activeMode === 'mutasi'
              ? 'Proses Mutasi & Terbitkan BA'
              : activeMode === 'hapus'
              ? 'Proses Penghapusan & Terbitkan BA'
              : activeMode === 'cetak_label'
              ? 'Cetak Stiker Label Barcode'
              : 'Simpan Registrasi Aset Baru'}
          </span>
        </button>
      </form>
    </div>
  );
};
