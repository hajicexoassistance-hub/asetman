# Rencana Fitur: Single Compact Donut Card pada BA Vault

Mengonsolidasi 4 kartu KPI terpisah di halaman **Arsip Berita Acara (BA Vault)** menjadi **satu kartu padat tunggal (Horizontal Split)** yang dilengkapi dengan **SVG Donut Chart mini** di sisi kiri dan **legenda 4 statistik ringkas** di sisi kanan untuk menghemat ruang vertikal dan memperjelas proporsi dokumen secara visual.

---

## 1. Rancangan Visual & Sisi UI/UX

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Arsip Berita Acara (BA Vault)]                         [ Ekspor Excel ]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────┐  │  ● Total BA Terbit       : 7 (5 Bln Ini)             │ │
│ │ │   (Donut)   │  │  ● Peminjaman Aktif      : 4 (1 Late)               │ │
│ │ │    7 BA     │  │  ● Mutasi & BAST Terima  : 1                         │ │
│ │ └─────────────┘  │  ● Pemusnahan / Afkir    : 0                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Highlights Design:
1. **Compact Horizontal Split**: Satu kontainer kartu (`p-3 bg-white border rounded-xl flex items-center gap-4`).
2. **SVG Donut Chart Mini (Kiri)**:
   - Diameter $80\text{px}$, stroke-width $8\text{px}$.
   - 4 segmen warna SVG sesuai jenis BA:
     - Emerald (`#2D7D62`): BAST Penerimaan
     - Amber (`#F59E0B`): BAST Peminjaman Aktif
     - Rose (`#EF4444`): Overdue Peminjaman
     - Purple (`#8B5CF6`): BA Penghapusan / Afkir
   - **Center Label**: Angka Total BA (`7 BA`) tercetak di pusat lingkaran.
3. **Legenda 4 Statistik Ringkas (Kanan)**:
   - Grid 2-kolom atau daftar 4 baris mini dengan titik warna (color indicator dot).
   - Menampilkan statistik real-time dengan angka `font-mono tabular-nums`.

---

## 2. Rencana Implementasi

1. **Komponen `BaVaultTab.tsx`**:
   - Ganti blok `grid grid-cols-2 lg:grid-cols-4 gap-2` yang lama dengan `CompactDonutKpiCard`.
   - Hitung persentase segmen Donut Chart secara otomatis berdasarkan data `docs` yang sudah di-filter.
2. **Komponen Inline `SvgDonutChart`**:
   - Buat komponen helper SVG donut yang menghitung `strokeDasharray` dan `strokeDashoffset` berdasarkan proporsi masing-masing jenis BA.
3. **Verifikasi**:
   - Jalankan `compile_applet` dan `lint_applet` untuk memastikan 0 error.
   - Uji kompilasi produksi `npm run build`.

---

## 3. Pertanyaan Konfirmasi

Apakah rencana desain **Single Compact Donut Card (Horizontal Split)** ini sudah sesuai untuk diimplementasikan ke kode?
