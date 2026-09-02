import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  FolderSync, 
  HardDrive, 
  Calendar,
  Layers,
  BookOpen,
  Cloud,
  CloudUpload,
  CloudDownload
} from 'lucide-react';
import { FullClassData } from '../types';
import { DatabaseService } from '../services/db';
import { FirebaseDbService } from '../services/firebaseDb';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  allClasses: FullClassData[];
  currentClassId: string;
  onSelectClass: (id: string) => void;
  onNewClass: () => void;
  onDeleteClass: (id: string) => void;
  onRefreshData: () => Promise<void>;
  onResetDatabase?: () => Promise<void>;
  onOpenDeleteDatabase?: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  allClasses,
  currentClassId,
  onSelectClass,
  onNewClass,
  onDeleteClass,
  onRefreshData,
  onResetDatabase,
  onOpenDeleteDatabase
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSyncAllToFirebase = async () => {
    try {
      setIsCloudSyncing(true);
      for (const cls of allClasses) {
        await FirebaseDbService.saveClass(cls);
      }
      setNotification({ type: 'success', message: `Berhasil mengunggah ${allClasses.length} data rombel ke Firebase Cloud Firestore!` });
      setTimeout(() => setNotification(null), 4000);
    } catch (e: any) {
      setNotification({ type: 'error', message: 'Gagal sinkronisasi ke Firebase: ' + (e.message || String(e)) });
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handlePullFromFirebase = async () => {
    try {
      setIsCloudSyncing(true);
      const remoteClasses = await FirebaseDbService.getAllClasses();
      if (remoteClasses.length === 0) {
        setNotification({ type: 'error', message: 'Belum ada data rekapitulasi kelas di Firebase Cloud Firestore.' });
        return;
      }
      for (const rc of remoteClasses) {
        await DatabaseService.saveClass(rc, false);
      }
      await onRefreshData();
      setNotification({ type: 'success', message: `Berhasil mengunduh dan menyinkronkan ${remoteClasses.length} rombel dari Firebase Cloud!` });
      setTimeout(() => setNotification(null), 4000);
    } catch (e: any) {
      setNotification({ type: 'error', message: 'Gagal memuat dari Firebase: ' + (e.message || String(e)) });
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const jsonString = await DatabaseService.exportBackupJSON();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cadangan_BasisData_WaliKelas_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setNotification({ type: 'success', message: 'Cadangan database (.json) berhasil diunduh!' });
      setTimeout(() => setNotification(null), 4000);
    } catch (e: any) {
      setNotification({ type: 'error', message: 'Gagal mengekspor cadangan: ' + e.message });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setIsImporting(true);
        const content = evt.target?.result as string;
        const count = await DatabaseService.importBackupJSON(content);
        await onRefreshData();
        setNotification({ type: 'success', message: `Berhasil memulihkan ${count} rombel kelas dari file backup!` });
        setTimeout(() => setNotification(null), 4000);
      } catch (err: any) {
        setNotification({ type: 'error', message: 'Gagal memulihkan cadangan: ' + err.message });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                Manajemen Basis Data & Firebase Cloud
              </h3>
              <p className="text-xs text-slate-300">
                Penyimpanan lokal IndexedDB & Sinkronisasi Cloud Firestore Terpusat
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {notification && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              {notification.message}
            </div>
          )}

          {/* Firebase Cloud Firestore Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80">
            <div className="mb-3">
              <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5 mb-1">
                <Cloud className="w-4 h-4 text-blue-600" />
                Firebase Cloud Firestore
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Aktif & Terhubung
                </span>
              </h4>
              <p className="text-[11px] text-slate-600">
                Data otomatis tersimpan ke cloud Firestore saat disimpan. Anda juga dapat melakukan sinkronisasi manual.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleSyncAllToFirebase}
                disabled={isCloudSyncing}
                className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                {isCloudSyncing ? 'Menyinkronkan...' : 'Unggah Semua ke Cloud'}
              </button>
              <button
                type="button"
                onClick={handlePullFromFirebase}
                disabled={isCloudSyncing}
                className="py-1.5 px-3 bg-white hover:bg-slate-100 disabled:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <CloudDownload className="w-3.5 h-3.5 text-blue-600" />
                Unduh Data dari Cloud
              </button>
            </div>
          </div>

          {/* Backup & Restore Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 mb-1">
                  <Download className="w-4 h-4 text-blue-600" />
                  Ekspor Cadangan (Backup JSON)
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Simpan seluruh basis data rekapitulasi ke dalam file .json untuk keamanan atau pindah perangkat.
                </p>
              </div>
              <button
                id="btn-export-backup-json"
                type="button"
                onClick={handleExportBackup}
                disabled={isExporting}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                {isExporting ? 'Mengekspor...' : 'Unduh File Cadangan (.json)'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 mb-1">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  Pulihkan Dari Cadangan (Restore)
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Muat data dari file cadangan .json yang pernah diunduh sebelumnya.
                </p>
              </div>
              <label className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5" />
                {isImporting ? 'Memulihkan...' : 'Pilih File Cadangan (.json)'}
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportBackup}
                />
              </label>
            </div>
          </div>

          {/* Daftar Rombel / Rekap Kelas yang Tersimpan di Basis Data */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-indigo-600" />
                Daftar Rombel Kelas Tersimpan ({allClasses.length})
              </h4>
              <button
                type="button"
                onClick={() => { onNewClass(); onClose(); }}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                + Buat Kelas Baru
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {allClasses.map((item) => {
                const isSelected = item.summary.id === currentClassId;
                const total = Number(item.summary.maleCount) + Number(item.summary.femaleCount);
                return (
                  <div
                    key={item.summary.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-2xs ring-1 ring-blue-400'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {item.summary.className || 'Kelas Baru'}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                              Sedang Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {item.summary.schoolName} • TA {item.summary.academicYear} ({item.summary.semester}) • {total} Siswa
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isSelected && (
                        <button
                          type="button"
                          onClick={() => { onSelectClass(item.summary.id); onClose(); }}
                          className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Buka
                        </button>
                      )}

                      {allClasses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus rekap data kelas ${item.summary.className}?`)) {
                              onDeleteClass(item.summary.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Rekap Kelas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {onOpenDeleteDatabase ? (
            <button
              id="btn-modal-open-delete-database"
              type="button"
              onClick={() => {
                onClose();
                onOpenDeleteDatabase();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-100/70 bg-rose-50 border border-rose-300 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Hapus Seluruh Database
            </button>
          ) : onResetDatabase ? (
            <button
              type="button"
              onClick={async () => {
                if (confirm('PERINGATAN: Apakah Anda yakin ingin mengosongkan seluruh data demo / kelas di aplikasi?')) {
                  await onResetDatabase();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-100/70 bg-rose-50 border border-rose-300 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Hapus Seluruh Database
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

