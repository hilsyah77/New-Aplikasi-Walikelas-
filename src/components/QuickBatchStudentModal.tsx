import React, { useState } from 'react';
import { 
  X, 
  ClipboardPaste, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Users
} from 'lucide-react';
import { StudentEntry, Gender, StudentStatus } from '../types';

interface QuickBatchStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  onAddBatch: (students: StudentEntry[]) => void;
}

export const QuickBatchStudentModal: React.FC<QuickBatchStudentModalProps> = ({
  isOpen,
  onClose,
  className,
  onAddBatch
}) => {
  const [inputText, setInputText] = useState('');
  const [defaultGender, setDefaultGender] = useState<Gender>('L');
  const [defaultStatus, setDefaultStatus] = useState<StudentStatus>('Siswa Reguler');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleParseAndSubmit = () => {
    setError('');
    const lines = inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      setError('Silakan masukkan atau tempel minimal satu nama siswa!');
      return;
    }

    const parsedStudents: StudentEntry[] = [];
    const now = new Date().toISOString();
    const todayDate = now.split('T')[0];

    lines.forEach((line, index) => {
      // Clean leading numbering like "1.", "01.", "1)", "1 - "
      let cleaned = line.replace(/^\d+[\.\)\-]\s*/, '').trim();

      // Check for inline gender marker like "(L)", "(P)", "[L]", "[P]"
      let gender: Gender = defaultGender;
      const lMatch = cleaned.match(/[\(\[\s](L|LK|LAKI)[\)\]\s]*$/i);
      const pMatch = cleaned.match(/[\(\[\s](P|PR|PEREMPUAN)[\)\]\s]*$/i);

      if (pMatch) {
        gender = 'P';
        cleaned = cleaned.replace(/[\(\[\s](P|PR|PEREMPUAN)[\)\]\s]*$/i, '').trim();
      } else if (lMatch) {
        gender = 'L';
        cleaned = cleaned.replace(/[\(\[\s](L|LK|LAKI)[\)\]\s]*$/i, '').trim();
      }

      if (cleaned.length > 0) {
        parsedStudents.push({
          id: 'std_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substring(2, 6),
          name: cleaned,
          nisn: '',
          nis: '',
          gender,
          status: defaultStatus,
          targetClass: className,
          entryDate: todayDate,
          documents: [],
          createdAt: now,
          updatedAt: now
        });
      }
    });

    if (parsedStudents.length === 0) {
      setError('Tidak ada nama valid yang berhasil diproses.');
      return;
    }

    onAddBatch(parsedStudents);
    setInputText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                Tempel Cepat Daftar Nama Siswa
              </h3>
              <p className="text-xs text-slate-300">
                Tambah banyak siswa sekaligus untuk Kelas {className}
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Daftar Nama Siswa (1 Nama per baris):</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Bisa menyertakan tanda (L) atau (P)
              </span>
            </label>
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Contoh:\n1. Ahmad Fauzi (L)\n2. Siti Aisyah (P)\n3. Budi Santoso (L)\n4. Dewi Sartika (P)`}
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender Standar (bila tanpa L/P)
              </label>
              <select
                value={defaultGender}
                onChange={(e) => setDefaultGender(e.target.value as Gender)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
              >
                <option value="L">Laki-Laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Status Awal
              </label>
              <select
                id="select-kategori-status-batch"
                value={defaultStatus}
                onChange={(e) => setDefaultStatus(e.target.value as StudentStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
              >
                <option value="Siswa Reguler">Siswa Reguler / Aktif</option>
                <option value="Siswa Baru">Siswa Baru</option>
                <option value="Siswa Pindahan (Masuk)">Siswa Pindahan (Masuk)</option>
                <option value="Siswa Pindahan (Keluar)">Siswa Pindahan (Keluar / Mutasi)</option>
                <option value="Siswa Keluar (Drop Out)">Siswa Keluar (Drop Out)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Sistem akan otomatis membersihkan nomor urut baris dan mendeteksi penanda jenis kelamin <strong>(L)</strong> atau <strong>(P)</strong> pada nama siswa.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleParseAndSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Tambahkan ke Daftar Siswa
          </button>
        </div>

      </div>
    </div>
  );
};
