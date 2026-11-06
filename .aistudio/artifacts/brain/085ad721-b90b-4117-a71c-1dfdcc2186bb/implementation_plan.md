# Rencana Perbaikan: Penyimpanan & Auto-Join Harga Perolehan & Depresiasi (Google Apps Script & Frontend)

## Diagnosa Masalah
1. **Penyebab Harga & Depresiasi Ter-reset/Hilang saat Edit & Sync**:
   - Di Google Apps Script (`Code.gs`), saat Sesi Stock Opname Aktif (misal tab `SO_SESI_001`), fungsi `getInitialDataInternal()` membaca baris aset dari tab `SO_SESI_001`.
   - Tab `SO_SESI_001` **tidak memiliki kolom keuangan** (`Harga_Perolehan`, `Tanggal_Perolehan`, `Masa_Manfaat`, `Nilai_Sisa`, `Nilai_Buku`, `Nomor_Seri`).
   - Akibatnya, API Apps Script mengembalikan data aset tanpa nilai keuangan (`undefined` / `Rp 0`), yang kemudian menimpa state di frontend & LocalStorage.

2. **Strategi Master Data Terpusat**:
   - Pengguna menyetujui bahwa data keuangan disimpan **hanya di tab `Master_Assets`**.
   - Apps Script akan secara otomatis **menggabungkan (JOIN)** data master keuangan dari `Master_Assets` ke data audit Sesi Stock Opname sebelum dikirimkan ke frontend.

---

## Langkah-Langkah Perbaikan

### 1. Update Skrip `Code.gs` Backend (Google Apps Script)
- **Fungsi `getInitialDataInternal()`**:
  - Saat membaca dari tab sesi `SO_SESI_xxx`, buat Lookup Map berdasarkan `ID_Asset` dari tab `Master_Assets`.
  - Gabungkan kolom `Harga_Perolehan`, `Tanggal_Perolehan`, `Masa_Manfaat`, `Nilai_Sisa`, `Nilai_Buku`, `Nomor_Seri`, dan `Jenis` dari `Master_Assets` ke setiap objek aset sesi.
- **Fungsi `updateAssetInternal()` & `addAssetInternal()`**:
  - Pastikan kolom `Harga_Perolehan`, `Tanggal_Perolehan`, `Masa_Manfaat`, `Nilai_Sisa`, `Nilai_Buku`, dan `Nomor_Seri` diperbarui secara presisi di tab `Master_Assets`.
  - Kembalikan data aset yang sudah di-JOIN dengan data keuangan terbaru dari `Master_Assets`.

### 2. Update Template Kode `Code.gs` di `src/components/CodeGsModal.tsx`
- Perbarui kode skrip Google Apps Script di modal panduan agar pengguna bisa langsung menyalin dan menimpa skrip di Google Sheets Apps Script milik mereka.

### 3. Perbaikan di Frontend `src/services/apiService.ts`
- Pada `normalizeRawAsset()`:
  - Pastikan jika Apps Script mengembalikan data lama atau `Harga_Perolehan` bernilai Kosong/Null, lakukan fallback pembacaan dari cache `LocalStorage` aset lokal agar harga dan depresiasi aset tidak pernah hilang.
- Pada `updateAsset()`:
  - Kirimkan bidang `Harga_Perolehan`, `Tanggal_Perolehan`, `Masa_Manfaat`, `Nilai_Sisa`, `Nilai_Buku`, `Nomor_Seri` dengan tipe numerik/string yang valid saat POST ke Apps Script.

---

## Verifikasi & Pengujian
1. Jalankan `compile_applet` dan `lint_applet` untuk memastikan tidak ada kesalahan tipe TypeScript atau impor.
2. Restart server development untuk menguji pengeditan aset, penyimpanan harga, dan perhitungan depresiasi.
