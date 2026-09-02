import React, { useMemo } from 'react';
import { 
  Users, 
  School, 
  Calendar, 
  User, 
  Calculator, 
  Sparkles,
  TrendingUp,
  CheckCircle2,
  FolderOpen,
  AlertTriangle
} from 'lucide-react';
import { ClassSummary, StudentEntry, FullClassData } from '../types';
import { findDuplicateSavedClass } from '../utils/classHelper';
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
  allSavedClasses?: FullClassData[];
  currentClassId?: string;
  onSelectSavedClass?: (id: string) => void;
}

export const ClassSummaryCard: React.FC<ClassSummaryCardProps> = ({
  summary,
  students,
  onChange,
  allSavedClasses = [],
  currentClassId,
  onSelectSavedClass
}) => {
  const maleCount = Number(summary.maleCount) || 0;
  const femaleCount = Number(summary.femaleCount) || 0;
  const totalStudents = maleCount + femaleCount;

  // Breakdown from student detailed list
  const maleInList = students.filter(s => s.gender === 'L').length;
  const femaleInList = students.filter(s => s.gender === 'P').length;

  const malePct = totalStudents > 0 ? ((maleCount / totalStudents) * 100).toFixed(1) : '0';
  const femalePct = totalStudents > 0 ? ((femaleCount / totalStudents) * 100).toFixed(1) : '0';

  // Check for duplicate saved class
  const duplicateSavedClass = useMemo(() => {
    return findDuplicateSavedClass(summary.className, allSavedClasses, currentClassId);
  }, [summary.className, allSavedClasses, currentClassId]);

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
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {summary.className ? `Rekapitulasi Kelas ${summary.className}` : 'Rekapitulasi (Pilih Kelas)'}
              </h2>
              {summary.teacherName ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  <User className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Wali Kelas: <strong className="text-white font-bold">{summary.teacherName}</strong></span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-800/80 text-amber-300 border border-amber-500/30">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Wali Kelas: <strong className="font-bold">Pilih Wali Kelas</strong></span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Identitas kelas & formulir penghitungan otomatis siswa laki-laki (L), perempuan (P), dan total rombel
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

        {/* Warning Alert if Duplicate Saved Class Exists */}
        {duplicateSavedClass && (
          <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-amber-950">
                    Info Data Ganda Terdeteksi!
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Rombel Kelas {summary.className} Sudah Tersimpan
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  Data Rombel <strong>Kelas {summary.className}</strong> sudah pernah disimpan ke database oleh <strong>{duplicateSavedClass.summary.teacherName || 'Wali Kelas'}</strong>. 
                  Untuk menjaga integritas data, wali kelas hanya dapat mengisi <strong>sekali simpan</strong> per rombel.
                </p>
              </div>
            </div>
            {onSelectSavedClass && (
              <button
                type="button"
                onClick={() => onSelectSavedClass(duplicateSavedClass.summary.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer shadow-2xs transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                Buka Data Tersimpan
              </button>
            )}
          </div>
        )}
        
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
              value={summary.className || ''}
              onChange={(e) => onChange({ className: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold text-slate-800 transition-all cursor-pointer"
            >
              <option value="">-- Pilih Kelas --</option>
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
              value={summary.teacherName || ''}
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

                {/* Wali Kelas Footer Row */}
                <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-700/50 text-slate-300">
                  <span className="text-slate-400">Wali Kelas:</span>
                  <span className="font-bold text-indigo-200 truncate max-w-[170px]" title={summary.teacherName || '-'}>
                    {summary.teacherName || 'Belum Dipilih'}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

