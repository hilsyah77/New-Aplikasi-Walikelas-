import React from 'react';
import { AlertTriangle, X, FolderOpen, ArrowRight, ShieldAlert } from 'lucide-react';
import { FullClassData } from '../types';

interface DuplicateWarningModalProps {
  duplicateData: FullClassData | null;
  onClose: () => void;
  onOpenExisting: (id: string) => void;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  duplicateData,
  onClose,
  onOpenExisting
}) => {
  if (!duplicateData) return null;

  const totalSiswa = (Number(duplicateData.summary.maleCount) || 0) + (Number(duplicateData.summary.femaleCount) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-amber-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                Info Data Ganda Terdeteksi
              </h3>
              <p className="text-xs text-amber-100">
                Aturan Pengisian Bersama Antar Wali Kelas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-100 hover:text-white hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <p className="font-bold text-sm text-amber-950 mb-1">
              Rombel Kelas {duplicateData.summary.className} Sudah Tersimpan!
            </p>
            <p>
              Wali kelas <strong>{duplicateData.summary.teacherName || 'Wali Kelas'}</strong> telah mengisi dan menyimpan data rombel ini ke basis data sebelumnya.
            </p>
            <div className="mt-2 pt-2 border-t border-amber-200 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
              <span>Primary Key: <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">{duplicateData.summary.primaryKey || duplicateData.summary.className}</code></span>
              <span>{totalSiswa} Siswa Terdaftar</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-normal">
            Sesuai ketentuan, <strong>wali kelas hanya bisa mengisi sekali simpan</strong> per rombel kelas agar pengisian bersama tidak saling tumpang tindih. 
          </p>

          <p className="text-xs text-slate-600 leading-normal">
            Anda dapat membuka data yang sudah tersimpan untuk meninjau atau memperbarui, atau mengganti pilihan nama kelas pada formulir.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Ganti Nama Kelas
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenExisting(duplicateData.summary.id);
              onClose();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            Buka Data Kelas {duplicateData.summary.className}
          </button>
        </div>

      </div>
    </div>
  );
};
