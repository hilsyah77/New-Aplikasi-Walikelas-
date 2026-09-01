import React from 'react';
import { 
  Users, 
  School, 
  Calendar, 
  User, 
  Calculator, 
  Sparkles,
  TrendingUp,
  History,
  CheckCircle2,
  FolderOpen,
  Trash2,
  FileSignature,
  Edit3,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { ClassSummary, StudentEntry, FullClassData } from '../types';
import { exportClassDataToPDF } from '../services/pdfExport';
import { exportClassDataToExcel } from '../services/excelExport';
import { 
  CLASS_OPTIONS, 
  ACADEMIC_YEAR_OPTIONS, 
  TEACHER_OPTIONS, 
  DEFAULT_SCHOOL_NAME 
} from '../constants';

interface ClassSummaryCardProps {
  summary: ClassSummary;
  students: StudentEntry[];
  onChange: (updatedSummary: Partial<ClassSummary>) => void;
  historyList?: FullClassData[];
  currentClassId?: string;
  onSelectHistoryClass?: (id: string) => void;
  onDeleteHistoryClass?: (id: string) => void;
}

export const ClassSummaryCard: React.FC<ClassSummaryCardProps> = ({
  summary,
  students,
  onChange,
  historyList = [],
  currentClassId,
  onSelectHistoryClass,
  onDeleteHistoryClass
}) => {
  const maleCount = Number(summary.maleCount) || 0;
  const femaleCount = Number(summary.femaleCount) || 0;
  const totalStudents = maleCount + femaleCount;

  // Breakdown from student detailed list
  const maleInList = students.filter(s => s.gender === 'L').length;
  const femaleInList = students.filter(s => s.gender === 'P').length;

  const malePct = totalStudents > 0 ? ((maleCount / totalStudents) * 100).toFixed(1) : '0';
  const femalePct = totalStudents > 0 ? ((femaleCount / totalStudents) * 100).toFixed(1) : '0';

  const handleMaleChange = (val: number) => {
    onChange({ maleCount: Math.max(0, val) });
  };

  const handleFemaleChange = (val: number) => {
    onChange({ femaleCount: Math.max(0, val) });
  };

  const syncFromList = () => {
    onChange({
      maleCount: maleInList,
      femaleCount: femaleInList
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Card Header */}
      <div className="px-5 py-4 sm:px-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/10">
            <School className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Identitas Kelas & Rekapitulasi Jumlah Siswa
            </h2>
            <p className="text-xs text-slate-300">
              Formulir penghitungan otomatis siswa laki-laki (L), perempuan (P), dan total rombel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
            <Calculator className="w-3.5 h-3.5 text-indigo-300" />
            Auto-Sum Aktif
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        
        {/* Section 1: Identitas Sekolah & Wali Kelas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Nama Sekolah */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-slate-400" />
              Nama Satuan Pendidikan / Sekolah
            </label>
            <input
              id="input-school-name"
              type="text"
              value={summary.schoolName || DEFAULT_SCHOOL_NAME}
              onChange={(e) => onChange({ schoolName: e.target.value })}
              placeholder={DEFAULT_SCHOOL_NAME}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium transition-all"
            />
          </div>

          {/* Rombel / Kelas (Dropdown 7A-7H, 8A-8H, 9A-9J) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Nama Kelas / Rombel
            </label>
            <select
              id="select-class-name"
              value={summary.className}
              onChange={(e) => onChange({ className: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold text-slate-800 transition-all cursor-pointer"
            >
              <optgroup label="Kelas 7 (7A - 7H)">
                {CLASS_OPTIONS.filter(c => c.startsWith('7')).map(cls => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </optgroup>
              <optgroup label="Kelas 8 (8A - 8H)">
                {CLASS_OPTIONS.filter(c => c.startsWith('8')).map(cls => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </optgroup>
              <optgroup label="Kelas 9 (9A - 9J)">
                {CLASS_OPTIONS.filter(c => c.startsWith('9')).map(cls => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </optgroup>
              {!CLASS_OPTIONS.includes(summary.className) && summary.className && (
                <option value={summary.className}>{summary.className}</option>
              )}
            </select>
          </div>

          {/* Tahun Ajaran & Semester */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tahun Ajaran
              </label>
              <select
                id="select-academic-year"
                value={summary.academicYear}
                onChange={(e) => onChange({ academicYear: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-semibold text-slate-800 transition-all cursor-pointer"
              >
                {ACADEMIC_YEAR_OPTIONS.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
                {!ACADEMIC_YEAR_OPTIONS.includes(summary.academicYear) && summary.academicYear && (
                  <option value={summary.academicYear}>{summary.academicYear}</option>
                )}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Semester
              </label>
              <select
                id="select-semester"
                value={summary.semester}
                onChange={(e) => onChange({ semester: e.target.value as 'Ganjil' | 'Genap' })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium transition-all cursor-pointer"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>

          {/* Nama Wali Kelas (Dropdown Pilihan Guru) */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nama Wali Kelas
            </label>
            <select
              id="select-teacher-name"
              value={summary.teacherName}
              onChange={(e) => onChange({ teacherName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold text-slate-800 transition-all cursor-pointer"
            >
              <option value="">-- Pilih Wali Kelas --</option>
              {TEACHER_OPTIONS.map(teacher => (
                <option key={teacher} value={teacher}>{teacher}</option>
              ))}
              {!TEACHER_OPTIONS.includes(summary.teacherName) && summary.teacherName && (
                <option value={summary.teacherName}>{summary.teacherName}</option>
              )}
            </select>
          </div>

        </div>

        {/* Divider */}
        <hr className="border-slate-100" />

        {/* Section 2: Core Auto-Summing Student Count Form */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Input Jumlah Siswa (Otomatis Menjumlah Sendiri)
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                  Wajib Diisi
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Masukkan jumlah siswa laki-laki dan perempuan. Sistem otomatis menghitung total keseluruhan.
              </p>
            </div>

            {students.length > 0 && (
              <button
                id="btn-sync-from-list"
                type="button"
                onClick={syncFromList}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                title="Sesuaikan dengan jumlah data siswa di daftar bawah"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Hitung Dari Daftar Siswa ({maleInList} L, {femaleInList} P)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Form Siswa Laki-Laki */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-b from-blue-50/70 to-blue-100/40 border-2 border-blue-200 hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Siswa Laki-Laki (L)
                </span>
                <span className="text-xs font-semibold text-blue-600 bg-white/80 px-2 py-0.5 rounded-md border border-blue-200">
                  {malePct}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-dec-male"
                  type="button"
                  onClick={() => handleMaleChange(maleCount - 1)}
                  disabled={maleCount <= 0}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-lg disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
                >
                  -
                </button>
                <div className="flex-1">
                  <input
                    id="input-male-count"
                    type="number"
                    min="0"
                    value={summary.maleCount}
                    onChange={(e) => handleMaleChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-center text-2xl sm:text-3xl font-extrabold text-blue-900 bg-white border border-blue-300 rounded-xl py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
                <button
                  id="btn-inc-male"
                  type="button"
                  onClick={() => handleMaleChange(maleCount + 1)}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-lg transition-colors shadow-2xs cursor-pointer"
                >
                  +
                </button>
              </div>

              <p className="text-[11px] text-blue-700/80 text-center mt-2 font-medium">
                Jumlah peserta didik laki-laki
              </p>
            </div>

            {/* 2. Form Siswa Perempuan */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-b from-rose-50/70 to-rose-100/40 border-2 border-rose-200 hover:border-rose-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Siswa Perempuan (P)
                </span>
                <span className="text-xs font-semibold text-rose-600 bg-white/80 px-2 py-0.5 rounded-md border border-rose-200">
                  {femalePct}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-dec-female"
                  type="button"
                  onClick={() => handleFemaleChange(femaleCount - 1)}
                  disabled={femaleCount <= 0}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold text-lg disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
                >
                  -
                </button>
                <div className="flex-1">
                  <input
                    id="input-female-count"
                    type="number"
                    min="0"
                    value={summary.femaleCount}
                    onChange={(e) => handleFemaleChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-center text-2xl sm:text-3xl font-extrabold text-rose-900 bg-white border border-rose-300 rounded-xl py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
                  />
                </div>
                <button
                  id="btn-inc-female"
                  type="button"
                  onClick={() => handleFemaleChange(femaleCount + 1)}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold text-lg transition-colors shadow-2xs cursor-pointer"
                >
                  +
                </button>
              </div>

              <p className="text-[11px] text-rose-700/80 text-center mt-2 font-medium">
                Jumlah peserta didik perempuan
              </p>
            </div>

            {/* 3. TOTAL HASIL KALKULASI OTOMATIS */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-b from-indigo-900 to-slate-900 text-white border-2 border-indigo-700 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Total Siswa Keseluruhan
                  </span>
                  <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    L + P Otomatis
                  </span>
                </div>
                <div className="flex items-baseline justify-center gap-2 py-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {totalStudents}
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    Siswa
                  </span>
                </div>
              </div>

              {/* Composition Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                <div className="flex justify-between text-[11px] font-medium text-slate-300">
                  <span>L: {maleCount} ({malePct}%)</span>
                  <span>P: {femaleCount} ({femalePct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${totalStudents > 0 ? (maleCount / totalStudents) * 100 : 50}%` }}
                    title={`Laki-Laki: ${maleCount} siswa`}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${totalStudents > 0 ? (femaleCount / totalStudents) * 100 : 50}%` }}
                    title={`Perempuan: ${femaleCount} siswa`}
                  />
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Divider */}
        <hr className="border-slate-200" />

        {/* Section 3: History / Riwayat Input Data Rekapitulasi */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Riwayat Input Data Rekapitulasi
              </h3>
              <p className="text-xs text-slate-500">
                Data akan ditampilkan di sini setelah Anda membubuhkan tanda tangan digital dan menekan tombol simpan
              </p>
            </div>
            {historyList.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                {historyList.length} Rekap Disimpan
              </span>
            )}
          </div>

          {/* History Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50">
            {historyList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-12 text-center">No</th>
                      <th className="py-2.5 px-4">Nama Wali Kelas</th>
                      <th className="py-2.5 px-4">Kelas</th>
                      <th className="py-2.5 px-4 text-center">Total Siswa</th>
                      <th className="py-2.5 px-4">Status & Waktu Pengesahan</th>
                      <th className="py-2.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 bg-white text-xs sm:text-sm">
                    {historyList.map((item, idx) => {
                      const isCurrent = item.summary.id === currentClassId;
                      const itemTotal = (Number(item.summary.maleCount) || 0) + (Number(item.summary.femaleCount) || 0);
                      const signedTime = item.summary.signedAt || item.summary.updatedAt;

                      return (
                        <tr 
                          key={item.summary.id}
                          className={`transition-colors ${isCurrent ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}
                        >
                          {/* No */}
                          <td className="py-3 px-4 text-center font-bold text-slate-400 text-xs">
                            {idx + 1}
                          </td>

                          {/* Nama Wali Kelas */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-indigo-600" />
                              {item.summary.teacherName || 'Wali Kelas'}
                            </div>
                            {item.summary.schoolName && (
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {item.summary.schoolName}
                              </div>
                            )}
                          </td>

                          {/* Kelas */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                              Kelas {item.summary.className || '-'}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              T.A {item.summary.academicYear} ({item.summary.semester})
                            </div>
                          </td>

                          {/* Total Siswa */}
                          <td className="py-3 px-4 text-center">
                            <div className="font-bold text-slate-800">
                              {itemTotal} Siswa
                            </div>
                            <div className="text-[10px] text-slate-500">
                              (L: {item.summary.maleCount || 0}, P: {item.summary.femaleCount || 0})
                            </div>
                          </td>

                          {/* Status & Waktu */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Tertandatangani
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {signedTime ? new Date(signedTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                            </div>
                          </td>

                          {/* Aksi */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Tombol Edit */}
                              {onSelectHistoryClass && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectHistoryClass(item.summary.id);
                                    const el = document.getElementById('section-summary');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border ${
                                    isCurrent 
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                                      : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
                                  }`}
                                  title="Edit data rekapitulasi kelas ini"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                              )}

                              {/* Tombol Ekspor PDF */}
                              <button
                                type="button"
                                onClick={() => {
                                  try {
                                    exportClassDataToPDF(item);
                                  } catch (e: any) {
                                    alert('Gagal mengekspor PDF: ' + e.message);
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                                title="Unduh Laporan PDF"
                              >
                                <FileText className="w-3.5 h-3.5 text-rose-600" />
                                <span>PDF</span>
                              </button>

                              {/* Tombol Ekspor Excel */}
                              <button
                                type="button"
                                onClick={() => {
                                  try {
                                    exportClassDataToExcel(item);
                                  } catch (e: any) {
                                    alert('Gagal mengekspor Excel: ' + e.message);
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                                title="Unduh File Excel (.xlsx)"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Excel</span>
                              </button>

                              {/* Tombol Hapus */}
                              {onDeleteHistoryClass && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteHistoryClass(item.summary.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus dari riwayat"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-2">
                  <FileSignature className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  Belum Ada Riwayat Rekapitulasi Tersimpan
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-1">
                  Lengkapi data kelas, bubuhkan tanda tangan digital di formulir bagian bawah, lalu klik tombol <span className="font-semibold text-indigo-600">"Simpan Rekapitulasi"</span> agar tercatat dalam riwayat ini.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

