import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  User
} from 'lucide-react';
import { StudentEntry, StudentStatus, Gender } from '../types';
import { CLASS_OPTIONS } from '../constants';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: StudentEntry) => void;
  initialData?: StudentEntry | null;
  defaultClassName: string;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultClassName
}) => {
  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [gender, setGender] = useState<Gender>('L');
  const [status, setStatus] = useState<StudentStatus>('Siswa Baru');
  const [targetClass, setTargetClass] = useState(defaultClassName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setNis(initialData.nis || '');
      setGender(initialData.gender || 'L');
      setStatus(initialData.status || 'Siswa Baru');
      setTargetClass(initialData.targetClass || defaultClassName);
    } else {
      setName('');
      setNis('');
      setGender('L');
      setStatus('Siswa Baru');
      setTargetClass(defaultClassName);
    }
    setError('');
  }, [initialData, defaultClassName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama lengkap siswa wajib diisi!');
      return;
    }
    if (!targetClass.trim()) {
      setError('Nama kelas tujuan wajib diisi!');
      return;
    }

    const studentToSave: StudentEntry = {
      id: initialData?.id || 'std_' + Date.now(),
      name: name.trim(),
      nisn: initialData?.nisn || '',
      nis: nis.trim(),
      gender,
      status,
      targetClass: targetClass.trim(),
      originSchool: '',
      entryDate: initialData?.entryDate || new Date().toISOString().split('T')[0],
      contactNumber: '',
      parentName: '',
      notes: '',
      documents: initialData?.documents || [],
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(studentToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {initialData ? 'Edit Data Siswa' : 'Input Data Siswa Baru, Siswa Pindahan (Mutasi) & Siswa Keluar (Drop Out)'}
              </h3>
              <p className="text-xs text-slate-300">
                Lengkapi nama, jenis kelamin, status (Baru / Mutasi / Drop Out), dan kelas siswa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {error}
            </div>
          )}

          {/* Nama Lengkap Siswa */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="modal-student-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap siswa"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Form Kelas & NIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Form Kelas <span className="text-rose-500">*</span>
              </label>
              <select
                id="modal-student-class"
                required
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-slate-800"
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
                {!CLASS_OPTIONS.includes(targetClass) && targetClass && (
                  <option value={targetClass}>{targetClass}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Induk Sekolah (NIS / No. Absen)
              </label>
              <input
                id="modal-student-nis"
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Contoh: 25260701 (Opsional)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Status & Jenis Kelamin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Status Siswa <span className="text-rose-500">*</span>
              </label>
              <select
                id="modal-student-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentStatus)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              >
                <option value="Siswa Baru">Siswa Baru</option>
                <option value="Siswa Pindahan (Masuk)">Siswa Pindahan (Masuk)</option>
                <option value="Siswa Pindahan (Keluar)">Siswa Pindahan (Keluar / Mutasi)</option>
                <option value="Siswa Keluar (Drop Out)">Siswa Keluar (Drop Out)</option>
                <option value="Siswa Reguler">Siswa Reguler / Aktif</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Kelamin <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('L')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gender === 'L'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-300"></span>
                  Laki-Laki (L)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('P')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gender === 'P'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-300"></span>
                  Perempuan (P)
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-save-student-modal"
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Data Siswa
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
