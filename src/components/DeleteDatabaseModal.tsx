import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  Download, 
  ShieldAlert, 
  Database, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';
import { FullClassData } from '../types';

interface DeleteDatabaseModalProps {
  isOpen: boolean;
  allClasses: FullClassData[];
  onConfirmDelete: () => Promise<void>;
  onClose: () => void;
}

export const DeleteDatabaseModal: React.FC<DeleteDatabaseModalProps> = ({
  isOpen,
  allClasses,
  onConfirmDelete,
  onClose
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const totalSiswa = allClasses.reduce((acc, c) => acc + (c.students?.length || 0), 0);
  const isInputValid = confirmText.trim().toUpperCase() === 'HAPUS';

  const handleDownloadBackup = () => {
    const jsonStr = JSON.stringify(allClasses, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_sebelum_hapus_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteDelete = async () => {
    if (!isInputValid) return;
    try {
      setIsDeleting(true);
      await onConfirmDelete();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setConfirmText('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Gagal menghapus database:', err);
      alert('Terjadi kesalahan saat menghapus database. Silakan coba lagi.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-rose-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur border border-white/20">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Hapus Seluruh Basis Data
              </h3>
              <p className="text-xs text-rose-100">
                Tindakan permanen untuk membersihkan data aplikasi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-rose-100 hover:text-white hover:bg-rose-500/50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Warning Banner */}
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              <p className="font-bold text-sm text-rose-950 mb-1">
                Peringatan: Seluruh data akan dihapus permanen!
              </p>
              <p>
                Tindakan ini akan menghapus semua rombel kelas, daftar siswa, catatan mutasi/DO, rekapitulasi, dan tanda tangan digital, baik dari <strong>Penyimpanan Browser (IndexedDB)</strong> maupun dari <strong>Cloud Database (Firestore)</strong>.
              </p>
            </div>
          </div>

          {/* Data to be deleted summary */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Kelas Tersimpan</span>
              <span className="text-lg font-extrabold text-slate-900">{allClasses.length} Rombel</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Siswa Terdaftar</span>
              <span className="text-lg font-extrabold text-slate-900">{totalSiswa} Siswa</span>
            </div>
          </div>

          {/* Download Backup suggestion */}
          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
            <div className="text-xs text-blue-950">
              <span className="font-bold block">Amankan Data Anda</span>
              <span className="text-blue-700 text-[11px]">Unduh file JSON cadangan sebelum menghapus database</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-800 bg-white hover:bg-blue-100/60 border border-blue-300 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              Unduh Backup
            </button>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-1.5 pt-1">
            <label htmlFor="input-confirm-delete-db" className="block text-xs font-bold text-slate-700">
              Ketik kata <span className="font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">HAPUS</span> di bawah ini untuk mengonfirmasi:
            </label>
            <input
              id="input-confirm-delete-db"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Ketik HAPUS di sini..."
              disabled={isDeleting}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 uppercase text-slate-900 placeholder:normal-case placeholder:font-normal"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200/70 border border-slate-300 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Batalkan
          </button>

          <button
            id="btn-confirm-execute-delete-db"
            type="button"
            onClick={handleExecuteDelete}
            disabled={!isInputValid || isDeleting}
            className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${
              isInputValid && !isDeleting
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Menghapus Database...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Database Terhapus!</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Hapus Database Sekarang</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
