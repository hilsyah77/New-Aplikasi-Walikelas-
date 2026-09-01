import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FullClassData } from '../types';

export function exportClassDataToPDF(data: FullClassData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const { summary, students, generalDocuments } = data;
  const totalStudents = Number(summary.maleCount) + Number(summary.femaleCount);
  const malePct = totalStudents > 0 ? ((Number(summary.maleCount) / totalStudents) * 100).toFixed(1) : '0';
  const femalePct = totalStudents > 0 ? ((Number(summary.femaleCount) / totalStudents) * 100).toFixed(1) : '0';

  // 1. Kop Surat & Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text((summary.schoolName || 'KEMENTERIAN PENDIDIKAN DAN KEBUDAYAAN').toUpperCase(), 105, 15, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('LAPORAN RESMI REKAPITULASI DATA SISWA & MUTASI KELAS', 105, 21, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Tahun Ajaran: ${summary.academicYear || '-'} | Semester: ${summary.semester} | Kelas: ${summary.className}`, 105, 26, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Line separator
  doc.setLineWidth(0.8);
  doc.line(14, 29, 196, 29);
  doc.setLineWidth(0.2);
  doc.line(14, 30, 196, 30);

  let currentY = 36;

  // 2. Info Wali Kelas & Identitas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('I. INFORMASI IDENTITAS KELAS', 14, currentY);
  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [],
    body: [
      ['Nama Satuan Pendidikan', `: ${summary.schoolName || '-'}`, 'Kelas / Rombel', `: ${summary.className || '-'}`],
      ['Tahun Ajaran / Semester', `: ${summary.academicYear} (${summary.semester})`, 'Wali Kelas', `: ${summary.teacherName || '-'}`],
      ['Status Verifikasi', `: ${summary.signatureDataUrl ? 'Sudah Ditandatangani' : 'Belum Ditandatangani'}`, 'Tanggal Cetak Laporan', `: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`]
    ],
    styles: { fontSize: 8.5, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42, fillColor: [248, 250, 252] },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 38, fillColor: [248, 250, 252] },
      3: { cellWidth: 47 },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 3. Rekapitulasi Jumlah Siswa (Kalkulasi Otomatis)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('II. REKAPITULASI JUMLAH SISWA (L/P/TOTAL)', 14, currentY);
  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    theme: 'striped',
    head: [['No', 'Kategori Jenis Kelamin', 'Jumlah Siswa', 'Persentase (%)', 'Keterangan']],
    body: [
      ['1', 'Laki-Laki (L)', `${summary.maleCount} Siswa`, `${malePct}%`, 'Siswa Aktif Terdata'],
      ['2', 'Perempuan (P)', `${summary.femaleCount} Siswa`, `${femalePct}%`, 'Siswa Aktif Terdata'],
      ['', 'TOTAL SISWA KELAS', `${totalStudents} Siswa`, '100.0%', 'Jumlah Total Seluruh Siswa'],
    ],
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 8.5, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 60, halign: 'left', fontStyle: 'bold' },
      2: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 45, halign: 'left' },
    },
    didParseCell: function(dataParse) {
      if (dataParse.row.index === 2) {
        dataParse.cell.styles.fillColor = [224, 231, 255];
        dataParse.cell.styles.textColor = [30, 58, 138];
        dataParse.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Tabel Siswa Pindahan / Siswa Baru / Drop Out
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`III. DAFTAR SISWA BARU, SISWA PINDAHAN (MUTASI) & SISWA KELUAR (DROP OUT) (${students.length} Siswa)`, 14, currentY);
  currentY += 4;

  const studentRows = students.length > 0
    ? students.map((std, idx) => [
        (idx + 1).toString(),
        std.name,
        std.targetClass || summary.className || '-',
        std.gender === 'L' ? 'L (Laki-laki)' : 'P (Perempuan)',
        std.status,
        std.nis || '-'
      ])
    : [['-', 'Belum ada catatan siswa baru, pindahan (mutasi) atau siswa keluar (drop out)', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['No', 'Nama Lengkap Siswa', 'Kelas', 'L/P', 'Kategori Status', 'NIS / No. Absen']],
    body: studentRows,
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70, fontStyle: 'bold' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 32 },
      5: { cellWidth: 20, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if we need new page for signature & statement
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // 5. Pernyataan Keabsahan & Tanda Tangan Digital
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('IV. PERNYATAAN KEABSAHAN DATA & PENGESAHAN WALI KELAS', 14, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  const statementText = `Saya yang bertanda tangan di bawah ini, Wali Kelas ${summary.className || ''} ${summary.schoolName || ''}, menyatakan dengan sesungguhnya dan penuh tanggung jawab bahwa seluruh data jumlah siswa (${totalStudents} siswa: ${summary.maleCount} Laki-laki, ${summary.femaleCount} Perempuan), data siswa baru/pindahan, serta berkas bukti terlampir telah diverifikasi secara akurat sesuai keadaan sebenarnya pada sistem administrasi kelas.`;
  const splitStatement = doc.splitTextToSize(statementText, 182);
  doc.text(splitStatement, 14, currentY);

  currentY += (splitStatement.length * 4) + 6;

  // Box Tanda Tangan di Kanan Bawah
  const sigBoxX = 115;
  const sigDateStr = `${summary.statementPlace || 'Tempat'}, ${summary.statementDate ? new Date(summary.statementDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(sigDateStr, sigBoxX, currentY);
  doc.text('Wali Kelas,', sigBoxX, currentY + 5);

  // If signature image exists, embed it
  if (summary.signatureDataUrl) {
    try {
      doc.addImage(summary.signatureDataUrl, 'PNG', sigBoxX + 5, currentY + 6, 22, 22);
    } catch (e) {
      console.warn('Could not render signature image on PDF', e);
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('(Belum ditandatangani secara digital)', sigBoxX, currentY + 18);
    doc.setTextColor(0, 0, 0);
  }

  // Teacher name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(summary.teacherName || 'Nama Wali Kelas', sigBoxX, currentY + 32);

  // Digital verification badge on left
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY + 2, 85, 34, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 118, 110);
  doc.text('VERIFIKASI & DIGITAL SIGNATURE', 18, currentY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Status: ${summary.signatureDataUrl ? 'TERVERIFIKASI & DITANDATANGANI' : 'DRAF / BELUM TTD'}`, 18, currentY + 14);
  doc.text(`Sistem: Aplikasi Rekapitulasi Data Wali Kelas`, 18, currentY + 19);
  doc.text(`ID Dokumen: ${summary.id}`, 18, currentY + 24);
  doc.text(`Tanggal Update: ${new Date(summary.updatedAt).toLocaleString('id-ID')}`, 18, currentY + 29);

  // Download PDF
  const filename = `Rekap_Siswa_${(summary.className || 'Kelas').replace(/\s+/g, '_')}_${(summary.academicYear || '').replace(/\//g, '-')}.pdf`;
  doc.save(filename);
}
