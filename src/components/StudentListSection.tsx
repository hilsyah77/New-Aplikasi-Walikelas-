import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2
} from 'lucide-react';
import { StudentEntry } from '../types';

interface StudentListSectionProps {
  students: StudentEntry[];
  onAddStudent: () => void;
  onEditStudent: (student: StudentEntry) => void;
  onDeleteStudent: (id: string) => void;
  onPreviewDoc?: (doc: any) => void;
}

export const StudentListSection: React.FC<StudentListSectionProps> = ({
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.nis && student.nis.toLowerCase().includes(searchTerm.toLowerCase())) ||
        student.targetClass.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchGender = genderFilter === 'all' || student.gender === genderFilter;

      return matchSearch && matchStatus && matchGender;
    });
  }, [students, searchTerm, statusFilter, genderFilter]);

  const countBaru = students.filter(s => s.status === 'Siswa Baru').length;
  const countPindahanMasuk = students.filter(s => s.status === 'Siswa Pindahan (Masuk)').length;
  const countPindahanKeluar = students.filter(s => s.status === 'Siswa Pindahan (Keluar)').length;
  const countDropOut = students.filter(s => s.status === 'Siswa Keluar (Drop Out)').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Section Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Data Siswa Baru , Siswa Pindahan (Mutasi) & Siswa Keluar (Drop Out)
              </h2>
              <p className="text-xs text-slate-500">
                apabila siswa belum masuk ke daftar nilai atau mengalami mutasi / keluar sekolah
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="btn-add-student-main"
          type="button"
          onClick={onAddStudent}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          + Tambah Siswa Baru / Pindahan / DO
        </button>
      </div>

      {/* Quick Summary Pill Tabs */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Siswa Baru')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'Siswa Baru'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            Siswa Baru ({countBaru})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Siswa Pindahan (Masuk)')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'Siswa Pindahan (Masuk)'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Pindahan Masuk ({countPindahanMasuk})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Siswa Pindahan (Keluar)')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'Siswa Pindahan (Keluar)'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            Pindahan Keluar ({countPindahanKeluar})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Siswa Keluar (Drop Out)')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'Siswa Keluar (Drop Out)'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            Drop Out ({countDropOut})
          </button>
        </div>

        {/* Filter Controls (Search & Gender) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="input-search-student"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, kelas..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>

          {/* Gender Filter */}
          <select
            id="select-filter-gender"
            aria-label="Filter berdasarkan jenis kelamin"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Gender</option>
            <option value="L">Laki-Laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4">Nama Lengkap Siswa</th>
              <th className="py-3 px-4">Form Kelas</th>
              <th className="py-3 px-4 text-center">L/P</th>
              <th className="py-3 px-4">Kategori Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, idx) => (
                <tr 
                  key={student.id} 
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* No */}
                  <td className="py-3 px-4 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>

                  {/* Nama */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {student.name}
                    </div>
                    {student.nis && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        NIS: {student.nis}
                      </div>
                    )}
                  </td>

                  {/* Form Kelas */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs">
                      {student.targetClass}
                    </span>
                  </td>

                  {/* Gender */}
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      student.gender === 'L'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {student.gender}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                      student.status === 'Siswa Baru'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : student.status === 'Siswa Pindahan (Masuk)'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : student.status === 'Siswa Pindahan (Keluar)'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : student.status === 'Siswa Keluar (Drop Out)'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {student.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditStudent(student)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Data Siswa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteStudent(student.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Data Siswa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 px-4 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {searchTerm ? 'Tidak ada siswa yang cocok dengan pencarian' : 'Belum Ada Data Siswa Baru, Pindahan (Mutasi) & Keluar (Drop Out)'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Gunakan tombol di atas untuk menambahkan siswa baru, siswa mutasi, atau siswa keluar (drop out)
                      </p>
                    </div>
                    {!searchTerm && (
                      <button
                        type="button"
                        onClick={onAddStudent}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Tambah Siswa Sekarang
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
