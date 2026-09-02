import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  ClipboardPaste, 
  RefreshCw, 
  CheckCircle2, 
  UserCheck, 
  ArrowRightLeft, 
  UserMinus,
  Sparkles,
  User,
  GraduationCap,
  Filter,
  ChevronDown
} from 'lucide-react';
import { StudentEntry, FullClassData } from '../types';
import { CLASS_OPTIONS } from '../constants';
import { QuickBatchStudentModal } from './QuickBatchStudentModal';

interface StudentListSectionProps {
  students: StudentEntry[];
  className: string;
  teacherName?: string;
  allClasses?: FullClassData[];
  activeClassId?: string;
  onSelectClass?: (classId: string) => void;
  onUpdateClassName?: (newClassName: string) => void;
  onAddStudent: () => void;
  onAddBatchStudents: (newStudents: StudentEntry[]) => void;
  onEditStudent: (student: StudentEntry) => void;
  onDeleteStudent: (id: string) => void;
  onSyncCountsToSummary?: () => void;
  summaryMaleCount?: number;
  summaryFemaleCount?: number;
}

export const StudentListSection: React.FC<StudentListSectionProps> = ({
  students,
  className,
  teacherName,
  allClasses,
  activeClassId,
  onSelectClass,
  onUpdateClassName,
  onAddStudent,
  onAddBatchStudents,
  onEditStudent,
  onDeleteStudent,
  onSyncCountsToSummary,
  summaryMaleCount = 0,
  summaryFemaleCount = 0
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const q = searchTerm.toLowerCase();
      const matchSearch = 
        student.name.toLowerCase().includes(q) ||
        (student.nis && student.nis.toLowerCase().includes(q)) ||
        (student.targetClass && student.targetClass.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchGender = genderFilter === 'all' || student.gender === genderFilter;

      return matchSearch && matchStatus && matchGender;
    });
  }, [students, searchTerm, statusFilter, genderFilter]);

  // Statistics
  const maleInList = students.filter(s => s.gender === 'L').length;
  const femaleInList = students.filter(s => s.gender === 'P').length;
  const countReguler = students.filter(s => s.status === 'Siswa Reguler').length;
  const countBaru = students.filter(s => s.status === 'Siswa Baru').length;
  const countPindahanMasuk = students.filter(s => s.status === 'Siswa Pindahan (Masuk)').length;
  const countPindahanKeluar = students.filter(s => s.status === 'Siswa Pindahan (Keluar)').length;
  const countDropOut = students.filter(s => s.status === 'Siswa Keluar (Drop Out)').length;

  const isCountsDiffer = (maleInList !== summaryMaleCount || femaleInList !== summaryFemaleCount) && students.length > 0;

  const handleClassChange = (selectedValue: string) => {
    if (!selectedValue) {
      if (onUpdateClassName) onUpdateClassName('');
      return;
    }

    if (selectedValue.startsWith('saved:')) {
      const targetId = selectedValue.replace('saved:', '');
      if (onSelectClass) onSelectClass(targetId);
      return;
    }

    // Check if class with this name already exists in database
    const matchingSaved = allClasses?.find(
      c => c.summary.className && c.summary.className.trim().toUpperCase() === selectedValue.trim().toUpperCase()
    );

    if (matchingSaved && matchingSaved.summary.id !== activeClassId) {
      if (onSelectClass) {
        onSelectClass(matchingSaved.summary.id);
        return;
      }
    }

    if (onUpdateClassName) {
      onUpdateClassName(selectedValue);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Section Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Daftar Nama Siswa per Kelas
              </h2>

              {/* Pilihan Kelas Dropdown Menu */}
              <div className="flex items-center gap-1.5 bg-blue-50/90 px-2.5 py-1 rounded-xl border border-blue-200 shadow-2xs">
                <GraduationCap className="w-4 h-4 text-blue-700 shrink-0" />
                <label htmlFor="select-class-roster-menu" className="text-xs font-bold text-blue-900 hidden sm:inline">
                  Pilihan Kelas:
                </label>
                <select
                  id="select-class-roster-menu"
                  value={className || ''}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="px-2.5 py-0.5 text-xs font-extrabold text-blue-900 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer shadow-2xs transition-all"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {allClasses && allClasses.length > 0 && (
                    <optgroup label="Kelas Tersimpan di Database">
                      {allClasses.map((cls) => (
                        <option 
                          key={cls.summary.id} 
                          value={cls.summary.className || `saved:${cls.summary.id}`}
                        >
                          {cls.summary.className ? `Kelas ${cls.summary.className}` : 'Pilih Kelas'} ({cls.students?.length || 0} Siswa){cls.summary.teacherName ? ` - ${cls.summary.teacherName}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}
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
                </select>
              </div>

              {/* Status Menu Dropdown: Menampilkan Status Kelas Terpilih */}
              {className ? (
                <span 
                  id="badge-status-class-roster"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Status: <strong className="font-extrabold text-emerald-900">Kelas {className} Terpilih</strong></span>
                </span>
              ) : (
                <span 
                  id="badge-status-class-roster"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Status: <strong className="font-extrabold text-amber-900">Pilih Kelas Terlebih Dahulu</strong></span>
                </span>
              )}

              {/* Wali Kelas Badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Wali Kelas: <strong className="text-slate-900 font-bold">{teacherName || 'Pilih Wali Kelas'}</strong></span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Roster lengkap seluruh nama siswa dalam rombongan belajar kelas, mencakup siswa reguler, baru, mutasi, dan DO
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Batch Paste Button */}
          <button
            type="button"
            onClick={() => setIsBatchModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors cursor-pointer"
            title="Tempel daftar nama banyak siswa sekaligus"
          >
            <ClipboardPaste className="w-4 h-4 text-indigo-600" />
            <span>Tempel Daftar Siswa</span>
          </button>

          {/* Add Single Student */}
          <button
            id="btn-add-student-main"
            type="button"
            onClick={onAddStudent}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            + Tambah Siswa
          </button>
        </div>
      </div>

      {/* Sync Banner if roster count differs from summary count */}
      {isCountsDiffer && onSyncCountsToSummary && (
        <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>
              Jumlah siswa di daftar ({students.length} Siswa: {maleInList} L / {femaleInList} P) berbeda dengan angka rekapitulasi ({summaryMaleCount + summaryFemaleCount} Siswa: {summaryMaleCount} L / {summaryFemaleCount} P).
            </span>
          </div>
          <button
            type="button"
            onClick={onSyncCountsToSummary}
            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Sinkronkan Angka ke Rekapitulasi
          </button>
        </div>
      )}

      {/* Filter Tabs & Status Menu Dropdown */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Menu Dropdown */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <label htmlFor="select-status-menu-dropdown" className="text-xs font-bold text-slate-700">
              Kategori Status:
            </label>
            <select
              id="select-status-menu-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">Semua Kategori Status ({students.length})</option>
              <option value="Siswa Reguler">Reguler / Aktif ({countReguler})</option>
              <option value="Siswa Baru">Siswa Baru ({countBaru})</option>
              <option value="Siswa Pindahan (Masuk)">Pindahan Masuk ({countPindahanMasuk})</option>
              <option value="Siswa Pindahan (Keluar)">Mutasi Keluar ({countPindahanKeluar})</option>
              <option value="Siswa Keluar (Drop Out)">Drop Out ({countDropOut})</option>
            </select>
          </div>

          {/* Quick Status Buttons */}
          <div className="hidden lg:flex flex-wrap items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({students.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Siswa Reguler')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'Siswa Reguler'
                  ? 'bg-slate-800 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reguler ({countReguler})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Siswa Baru')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'Siswa Baru'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Baru ({countBaru})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Siswa Pindahan (Masuk)')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'Siswa Pindahan (Masuk)'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Masuk ({countPindahanMasuk})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Siswa Pindahan (Keluar)')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'Siswa Pindahan (Keluar)'
                  ? 'bg-amber-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Keluar ({countPindahanKeluar})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Siswa Keluar (Drop Out)')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'Siswa Keluar (Drop Out)'
                  ? 'bg-rose-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              DO ({countDropOut})
            </button>
          </div>
        </div>

        {/* Gender Filter pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setGenderFilter(genderFilter === 'L' ? 'all' : 'L')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
              genderFilter === 'L'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
            }`}
          >
            L ({maleInList})
          </button>
          <button
            type="button"
            onClick={() => setGenderFilter(genderFilter === 'P' ? 'all' : 'P')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
              genderFilter === 'P'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
            }`}
          >
            P ({femaleInList})
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="input-search-student-roster"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama siswa atau NIS..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="text-slate-500 text-[11px]">
          Menampilkan <strong className="text-slate-800">{filteredStudents.length}</strong> dari {students.length} siswa
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        {filteredStudents.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-28">NIS / No. Absen</th>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
                <th className="py-3 px-4 text-center w-24">L/P</th>
                <th className="py-3 px-4">Kategori Status</th>
                <th className="py-3 px-4 text-center w-24">Kelas</th>
                <th className="py-3 px-4 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredStudents.map((student, idx) => {
                const isMale = student.gender === 'L';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* No */}
                    <td className="py-3 px-4 text-center font-bold text-slate-400 text-xs">
                      {idx + 1}
                    </td>

                    {/* NIS */}
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {student.nis || '-'}
                    </td>

                    {/* Nama Lengkap */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <span>{student.name}</span>
                    </td>

                    {/* Jenis Kelamin L/P */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isMale 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isMale ? 'bg-blue-500' : 'bg-rose-500'}`}></span>
                        {isMale ? 'L' : 'P'}
                      </span>
                    </td>

                    {/* Kategori Status Siswa Dropdown */}
                    <td className="py-3 px-4">
                      <div className="relative inline-flex items-center">
                        <select
                          id={`select-status-student-${student.id}`}
                          value={student.status}
                          onChange={(e) => onEditStudent({
                            ...student,
                            status: e.target.value as any
                          })}
                          title="Pilih / Ubah Kategori Status Siswa"
                          className={`appearance-none pl-7 pr-6 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                            student.status === 'Siswa Baru'
                              ? 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100/90 focus:ring-blue-400'
                              : student.status === 'Siswa Pindahan (Masuk)'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100/90 focus:ring-emerald-400'
                              : student.status === 'Siswa Pindahan (Keluar)'
                              ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/90 focus:ring-amber-400'
                              : student.status === 'Siswa Keluar (Drop Out)'
                              ? 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100/90 focus:ring-rose-400'
                              : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200/90 focus:ring-slate-400'
                          }`}
                        >
                          <option value="Siswa Reguler">Siswa Reguler / Aktif</option>
                          <option value="Siswa Baru">Siswa Baru</option>
                          <option value="Siswa Pindahan (Masuk)">Siswa Pindahan (Masuk)</option>
                          <option value="Siswa Pindahan (Keluar)">Siswa Pindahan (Keluar / Mutasi)</option>
                          <option value="Siswa Keluar (Drop Out)">Siswa Keluar (Drop Out)</option>
                        </select>

                        {/* Leading Icon */}
                        <div className="absolute left-2 pointer-events-none">
                          {student.status === 'Siswa Baru' && <UserPlus className="w-3.5 h-3.5 text-blue-700" />}
                          {student.status === 'Siswa Pindahan (Masuk)' && <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />}
                          {student.status === 'Siswa Pindahan (Keluar)' && <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />}
                          {student.status === 'Siswa Keluar (Drop Out)' && <UserMinus className="w-3.5 h-3.5 text-rose-700" />}
                          {student.status === 'Siswa Reguler' && <UserCheck className="w-3.5 h-3.5 text-slate-700" />}
                        </div>

                        {/* Dropdown Chevron */}
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 pointer-events-none" />
                      </div>
                    </td>

                    {/* Kelas */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-700 text-xs px-2 py-0.5 bg-slate-100 rounded-md">
                        {student.targetClass || className || '-'}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit data siswa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus data siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              {searchTerm ? 'Tidak ada siswa yang sesuai pencarian' : `Belum Ada Nama Siswa Terdaftar untuk Kelas ${className || ''}`}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Tambahkan siswa satu per satu dengan tombol <span className="font-semibold text-blue-600">"+ Tambah Siswa"</span> atau tempel daftar nama sekaligus menggunakan <span className="font-semibold text-indigo-600">"Tempel Daftar Siswa"</span>.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors cursor-pointer"
              >
                <ClipboardPaste className="w-4 h-4" />
                Tempel Cepat Nama Siswa
              </button>
              <button
                type="button"
                onClick={onAddStudent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                + Tambah Siswa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Paste Modal */}
      <QuickBatchStudentModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        className={className}
        onAddBatch={onAddBatchStudents}
      />

    </div>
  );
};
