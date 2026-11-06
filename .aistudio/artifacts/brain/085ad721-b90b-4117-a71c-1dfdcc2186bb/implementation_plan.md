# Rencana Fitur: Pencarian & Kamera Scanner Kontekstual di Header

Menyesuaikan visibilitas bilah **Pencarian & Kamera Scanner** di komponen `Header` secara kontekstual sesuai halaman yang aktif. Bilah pencarian hanya muncul di halaman yang relevan dengan pencarian barang/arsip, dan menyembunyikannya di halaman Beranda & Setelan agar Header menjadi lebih tipis dan hemat ruang.

---

## 1. Aturan Visibilitas Per Halaman

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TAB ACTIVE               │ BILAH PENCARIAN & KAMERA SCANNER                 │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ Aset ('assets')          │ TAMPIL (Pencarian Katalog & Barcode Scan)        │
│ POS ('pos')              │ TAMPIL (Pencarian & Fast Checkout Scan)          │
│ Arsip ('archive')        │ TAMPIL (Pencarian No. BA, Tag ID, & PIC)         │
│ Audit SO (Audit View)    │ TAMPIL (Verifikasi SO & Scan Aset)               │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ Beranda ('dashboard')    │ SEMBUNYI (Header Tipis Single-Row ~40px)         │
│ Setelan ('settings')     │ SEMBUNYI (Header Tipis Single-Row ~40px)         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Rencana Perubahan Kode

1. **Perbarui `Header.tsx`**:
   - Tambahkan prop `activeTab?: string` dan `isAuditViewActive?: boolean` (atau `showSearchRow?: boolean`).
   - Tentukan variabel `showSearchRow = isAuditViewActive || ['assets', 'pos', 'archive'].includes(activeTab)`.
   - Render baris pencarian & tombol kamera secara kondisional (`{showSearchRow && (...)}`).
   - Sesuaikan padding header secara otomatis (`py-1.5` saat sembunyi, `py-2.5` saat tampil).

2. **Perbarui `App.tsx`**:
   - Teruskan `activeTab` dan `isAuditViewActive` ke komponen `<Header />`.

3. **Verifikasi**:
   - Jalankan `compile_applet` dan `lint_applet` bersamaan untuk memastikan 0 error.
   - Jalankan `npm run build` untuk memverifikasi bundle produksi.

---

## 3. Pertanyaan Konfirmasi

Apakah rencana pencarian & kamera scanner kontekstual di Header ini sudah sesuai untuk diimplementasikan?
