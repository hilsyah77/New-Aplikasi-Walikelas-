import * as XLSX from 'xlsx';
import { FullClassData } from '../types';

export function exportClassDataToExcel(data: FullClassData) {
  const { summary, students, generalDocuments } = data;
  const totalStudents = Number(summary.maleCount) + Number(summary.femaleCount);
  const malePct = totalStudents > 0 ? ((Number(summary.maleCount) / totalStudents) * 100).toFixed(1) + '%' : '0%';
  const femalePct = totalStudents > 0 ? ((Number(summary.femaleCount) / totalStudents) * 100).toFixed(1) + '%' : '0%';

  const wb = XLSX.utils.book_new();

  // 1. Sheet Rekapitulasi Utama
  const rekapData: (string | number)[][] = [
    ['REKAPITULASI DATA SISWA & MUTASI KELAS'],
    ['SATUAN PENDIDIKAN', summary.schoolName || '-'],
    ['TAHUN AJARAN / SEMESTER', `${summary.academicYear} (${summary.semester})`],
    ['ROMBONGAN BELAJAR / KELAS', summary.className || '-'],
    ['WALI KELAS', summary.teacherName || '-'],
    ['TANGGAL DIBUAT', new Date().toLocaleDateString('id-ID')],
    [],
    ['TABEL REKAPITULASI JUMLAH SISWA'],
    ['No', 'Jenis Kelamin', 'Jumlah (Siswa)', 'Persentase (%)', 'Keterangan'],
    [1, 'Laki-Laki (L)', Number(summary.maleCount), malePct, 'Siswa Aktif Terdata'],
    [2, 'Perempuan (P)', Number(summary.femaleCount), femalePct, 'Siswa Aktif Terdata'],
    ['TOTAL', 'TOTAL KESELURUHAN', totalStudents, '100.0%', 'Jumlah Total Seluruh Siswa di Kelas'],
    [],
    ['STATUS PENGESAHAN WALI KELAS'],
    ['Tempat & Tanggal Pengesahan', `${summary.statementPlace || '-'}, ${summary.statementDate || '-'}`],
    ['Status Tanda Tangan Digital', summary.signatureDataUrl ? 'SUDAH DITANDATANGANI SECARA DIGITAL' : 'BELUM DITANDATANGANI'],
    ['Pernyataan Keabsahan', summary.statementAgreed ? 'Wali kelas telah menyatakan keabsahan data secara sadar dan bertanggung jawab' : 'Belum diverifikasi'],
  ];

  const wsRekap = XLSX.utils.aoa_to_sheet(rekapData);
  // Column widths
  wsRekap['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 20 },
    { wch: 18 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekapitulasi Kelas');

  // 2. Sheet Siswa Baru & Pindahan
  const studentHeader = [
    'No',
    'Nama Lengkap Siswa',
    'Form Kelas',
    'Jenis Kelamin (L/P)',
    'Kategori Status Siswa',
    'Nomor Induk Sekolah (NIS)'
  ];

  const studentDataRows = students.map((std, idx) => [
    idx + 1,
    std.name,
    std.targetClass || summary.className || '-',
    std.gender === 'L' ? 'L (Laki-laki)' : 'P (Perempuan)',
    std.status,
    std.nis || '-'
  ]);

  const wsStudents = XLSX.utils.aoa_to_sheet([
    ['DATA SISWA BARU, SISWA PINDAHAN (MUTASI) & SISWA KELUAR (DROP OUT)'],
    [`Kelas: ${summary.className} | Sekolah: ${summary.schoolName} | Wali Kelas: ${summary.teacherName}`],
    [],
    studentHeader,
    ...studentDataRows
  ]);

  wsStudents['!cols'] = [
    { wch: 5 },
    { wch: 35 },
    { wch: 15 },
    { wch: 22 },
    { wch: 32 },
    { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Siswa Baru, Mutasi & DO');

  // 3. Sheet Dokumen Bukti
  const allDocs: (string | number)[][] = [
    ['DAFTAR BERKAS BUKTI DATA SISWA VALID'],
    ['No', 'Nama Siswa Terkait', 'Jenis Dokumen', 'Nama File Dokumen', 'Status Verifikasi', 'Catatan Verifikasi', 'Tanggal Upload']
  ];

  let docIndex = 1;
  // Student documents
  students.forEach(std => {
    if (std.documents && std.documents.length > 0) {
      std.documents.forEach(doc => {
        allDocs.push([
          docIndex++,
          std.name,
          doc.documentType,
          doc.fileName,
          doc.status,
          doc.notes || '-',
          doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('id-ID') : '-'
        ]);
      });
    }
  });

  // General documents
  if (generalDocuments && generalDocuments.length > 0) {
    generalDocuments.forEach(doc => {
      allDocs.push([
        docIndex++,
        doc.studentName || 'Dokumen Kelas Umum',
        doc.documentType,
        doc.fileName,
        doc.status,
        doc.notes || '-',
        doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('id-ID') : '-'
      ]);
    });
  }

  const wsDocs = XLSX.utils.aoa_to_sheet(allDocs);
  wsDocs['!cols'] = [
    { wch: 5 },
    { wch: 28 },
    { wch: 24 },
    { wch: 30 },
    { wch: 22 },
    { wch: 30 },
    { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, wsDocs, 'Bukti Dokumen Valid');

  // Export
  const filename = `Rekap_Data_Siswa_${(summary.className || 'Kelas').replace(/\s+/g, '_')}_${(summary.academicYear || '').replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, filename);
}
