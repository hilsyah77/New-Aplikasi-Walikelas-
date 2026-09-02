import React, { useState, useMemo } from 'react';
import { 
  FolderCheck, 
  User, 
  Calendar, 
  Users, 
  FileText, 
  FileSpreadsheet, 
  Trash2, 
  FolderOpen, 
  CheckCircle2, 
  Search,
  Key,
  School,
  Sparkles
} from 'lucide-react';
import { FullClassData } from '../types';
import { getClassPrimaryKey } from '../utils/classHelper';
import { exportClassDataToPDF } from '../services/pdfExport';
import { exportClassDataToExcel } from '../services/excelExport';

interface SavedRombelSectionProps {
  savedClasses: FullClassData[];
  currentClassId: string;
  onSelectClass: (id: string) => void;
  onDeleteClass: (id: string) => void;
}

export const SavedRombelSection: React.FC<SavedRombelSectionProps> = ({
  savedClasses,
  currentClassId,
  onSelectClass,
  onDeleteClass
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only classes that have been saved / have data, and match search
  const filteredClasses = useMemo(() => {
    return savedClasses.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchName = (item.summary.className || '').toLowerCase().includes(q);
      const matchTeacher = (item.summary.teacherName || '').toLowerCase().includes(q);
      const matchSchool = (item.summary.schoolName || '').toLowerCase().includes(q);
      const matchYear = (item.summary.academicYear || '').toLowerCase().includes(q);
      return matchName || matchTeacher || matchSchool || matchYear;
    });
  }, [savedClasses, searchTerm]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Section Header */}
      <div className="px-5 py-4 sm:px-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <FolderCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Daftar Rombel Kelas Tersimpan
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                <Key className="w-3 h-3" />
                Primary Key: Nama Kelas
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Data rombel yang tersimpan di database dapat dipanggil kembali kapan saja tanpa risiko data tumpang tindih
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {savedClasses.length} Rombel Tersimpan
          </span>
        </div>
      </div>

      {/* Control Bar: Search & Info */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="input-search-saved-rombel"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari rombel kelas, nama wali kelas, atau tahun ajaran..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Klik tombol <strong>"Buka Data Kelas"</strong> untuk memanggil data kelas yang diinginkan.</span>
        </div>
      </div>

      {/* Saved Classes Table / List */}
      <div className="overflow-x-auto">
        {filteredClasses.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Rombel / Kelas</th>
                <th className="py-3 px-4">Wali Kelas</th>
                <th className="py-3 px-4">Tahun Ajaran</th>
                <th className="py-3 px-4 text-center">Rekap Siswa</th>
                <th className="py-3 px-4 text-center">Daftar Nama</th>
                <th className="py-3 px-4">Waktu Tersimpan</th>
                <th className="py-3 px-4 text-right">Aksi & Panggil Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 bg-white text-xs sm:text-sm">
              {filteredClasses.map((item, idx) => {
                const isCurrent = item.summary.id === currentClassId;
                const totalStudents = (Number(item.summary.maleCount) || 0) + (Number(item.summary.femaleCount) || 0);
                const studentRosterCount = item.students?.length || 0;
                const primaryKey = getClassPrimaryKey(item.summary.className);
                const signedTime = item.summary.signedAt || item.summary.updatedAt;

                return (
                  <tr 
                    key={item.summary.id}
                    className={`transition-colors ${
                      isCurrent ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* No */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                      {idx + 1}
                    </td>

                    {/* Nama Rombel & Primary Key */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-200">
                          Kelas {item.summary.className || '-'}
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Sedang Dibuka
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                        <Key className="w-2.5 h-2.5 text-slate-400" />
                        PK: {primaryKey}
                      </div>
                    </td>

                    {/* Wali Kelas */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        {item.summary.teacherName || 'Wali Kelas'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.summary.teacherNip ? `NIP. ${item.summary.teacherNip}` : (item.summary.schoolName || 'Satuan Pendidikan')}
                      </div>
                    </td>

                    {/* Tahun Ajaran & Semester */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.summary.academicYear}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Semester {item.summary.semester}
                      </div>
                    </td>

                    {/* Rekap Siswa */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-slate-900 text-sm">
                        {totalStudents} Siswa
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-center gap-2 mt-0.5">
                        <span className="text-blue-700 font-semibold">L: {item.summary.maleCount || 0}</span>
                        <span>•</span>
                        <span className="text-rose-700 font-semibold">P: {item.summary.femaleCount || 0}</span>
                      </div>
                    </td>

                    {/* Daftar Nama Siswa Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                        studentRosterCount > 0 
                          ? 'bg-teal-50 text-teal-800 border border-teal-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        <Users className="w-3.5 h-3.5" />
                        {studentRosterCount} Nama
                      </span>
                    </td>

                    {/* Waktu Simpan & Pengesahan */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Tersimpan di DB
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {signedTime ? new Date(signedTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Tombol Panggil / Buka Data */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectClass(item.summary.id);
                            const el = document.getElementById('section-summary');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer border ${
                            isCurrent
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                          }`}
                          title="Panggil data kelas ini ke formulir"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{isCurrent ? 'Aktif' : 'Buka Data'}</span>
                        </button>

                        {/* Ekspor PDF */}
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
                          title="Unduh Surat & Rekapitulasi PDF"
                        >
                          <FileText className="w-3.5 h-3.5 text-rose-600" />
                          <span>PDF</span>
                        </button>

                        {/* Ekspor Excel */}
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
                          title="Unduh Berkas Excel (.xlsx)"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Excel</span>
                        </button>

                        {/* Hapus */}
                        <button
                          type="button"
                          onClick={() => onDeleteClass(item.summary.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus data kelas dari database"
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
          <div className="py-10 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3 border border-indigo-100">
              <FolderCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              {searchTerm ? 'Tidak Ditemukan Rombel Sesuai Pencarian' : 'Belum Ada Rombel Kelas Tersimpan'}
            </p>
            <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1.5">
              {searchTerm 
                ? `Coba kata kunci pencarian lain untuk menemukan rombel kelas.` 
                : `Setiap data rombel yang telah dibubuhi tanda tangan digital dan ditekan tombol "Simpan Data Rekapitulasi" akan tercatat di sini dan tersimpan permanen di database dengan Primary Key nama kelas.`
              }
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
