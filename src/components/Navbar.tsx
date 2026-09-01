import React from 'react';
import { 
  GraduationCap, 
  Database, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2,
  FolderSync,
  Cloud
} from 'lucide-react';
import { FullClassData } from '../types';

interface NavbarProps {
  currentClass: FullClassData;
  allClasses: FullClassData[];
  onSelectClass: (id: string) => void;
  onNewClass?: () => void;
  onOpenBackup: () => void;
  lastSavedTime: string | null;
  isSaving: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentClass,
  allClasses,
  onSelectClass,
  onOpenBackup,
  lastSavedTime,
  isSaving
}) => {

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                  SIM Rekap Wali Kelas
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  Firebase Terhubung
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Rekapitulasi Siswa, Mutasi Pindahan, Siswa Keluar (Drop Out) & Tanda Tangan Digital
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Database Auto-Save Status */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              {isSaving ? (
                <span className="text-amber-600 font-medium animate-pulse flex items-center gap-1">
                  <FolderSync className="w-3 h-3 animate-spin" /> Menyimpan...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                  {lastSavedTime ? `Tersimpan ${lastSavedTime}` : 'Tersimpan'}
                </span>
              )}
            </div>

            {/* Class Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
              <BookOpen className="w-4 h-4 text-slate-500 hidden sm:inline" />
              <select
                id="navbar-class-select"
                aria-label="Pilih Rombongan Belajar Kelas"
                value={currentClass.summary.id}
                onChange={(e) => onSelectClass(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none pr-1 py-1 cursor-pointer"
              >
                {allClasses.map((cls) => (
                  <option key={cls.summary.id} value={cls.summary.id}>
                    {cls.summary.className || 'Kelas'} ({cls.summary.academicYear})
                  </option>
                ))}
              </select>
            </div>

            {/* Backup & Database Manager Modal Button */}
            <button
              id="btn-navbar-backup-manager"
              type="button"
              onClick={onOpenBackup}
              title="Kelola Data & Cadangan Database"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Basis Data</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

