import { JenisBeritaAcara } from '../types';

export function getRomanMonth(monthZeroIndexed: number): string {
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romanMonths[monthZeroIndexed] || 'I';
}

export function getBaTypeCode(jenis: JenisBeritaAcara): string {
  switch (jenis) {
    case 'BAST Penerimaan':
      return 'BAST-IN';
    case 'BAST Peminjaman':
      return 'BA-PJM';
    case 'BA Pengembalian':
      return 'BA-KBL';
    case 'BA Mutasi':
      return 'BA-MUT';
    case 'BA Penghapusan':
      return 'BA-HPS';
    case 'BA Stock Opname':
      return 'BA-SO';
    case 'BA Pelelangan':
      return 'BA-LELANG';
    default:
      return 'BA-DOC';
  }
}

export function generateStandardBaNumber(
  jenis: JenisBeritaAcara,
  unitCode: string = 'HRD',
  sequenceIndex: number = 1,
  dateObj: Date = new Date()
): string {
  const seqStr = String(sequenceIndex).padStart(3, '0');
  const typeCode = getBaTypeCode(jenis);
  const cleanUnit = (unitCode || 'GEN').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'GEN';
  const romanMonth = getRomanMonth(dateObj.getMonth());
  const year = dateObj.getFullYear();

  return `${seqStr}/${typeCode}/${cleanUnit}/${romanMonth}/${year}`;
}
