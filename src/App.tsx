import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GraduationCap, 
  Database, 
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { FullClassData, ClassSummary, StudentEntry, DocumentProof, VerificationStatus } from './types';
import { DatabaseService } from './services/db';
import { Navbar } from './components/Navbar';
import { ClassSummaryCard } from './components/ClassSummaryCard';
import { StudentListSection } from './components/StudentListSection';
import { StudentFormModal } from './components/StudentFormModal';
import { DocumentUploadSection } from './components/DocumentUploadSection';
import { StatementSignatureSection } from './components/StatementSignatureSection';
import { ExportSection } from './components/ExportSection';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { BackupModal } from './components/BackupModal';

export default function App() {
  const [allClasses, setAllClasses] = useState<FullClassData[]>([]);
  const [currentClass, setCurrentClass] = useState<FullClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentEntry | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentProof | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load from IndexedDB
  const loadDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      let classes = await DatabaseService.getAllClasses();
      
      // Clean up legacy demo students (if any exist from earlier template)
      let hasUpdatedLegacy = false;
      const demoNames = ['Muhammad Rizky Pratama', 'Aisyah Putri Azzahra', 'Dimas Aditya Saputra'];
      
      classes = await Promise.all(
        classes.map(async (cls) => {
          const filteredStudents = (cls.students || []).filter(s => !demoNames.includes(s.name));
          if (filteredStudents.length !== (cls.students || []).length) {
            hasUpdatedLegacy = true;
            const updated = {
              ...cls,
              students: filteredStudents,
              // If maleCount and femaleCount were default 16 from template, reset to 0
              summary: {
                ...cls.summary,
                maleCount: (cls.summary.maleCount === 16 && cls.summary.femaleCount === 16) ? 0 : cls.summary.maleCount,
                femaleCount: (cls.summary.maleCount === 16 && cls.summary.femaleCount === 16) ? 0 : cls.summary.femaleCount,
              }
            };
            await DatabaseService.saveClass(updated);
            return updated;
          }
          return cls;
        })
      );

      if (classes.length === 0) {
        // Create clean initial class
        const defaultClass = DatabaseService.createDefaultClass();
        await DatabaseService.saveClass(defaultClass);
        setAllClasses([defaultClass]);
        setCurrentClass(defaultClass);
        DatabaseService.setActiveId(defaultClass.summary.id);
      } else {
        setAllClasses(classes);
        const activeId = DatabaseService.getActiveId();
        const active = classes.find(c => c.summary.id === activeId) || classes[0];
        setCurrentClass(active);
      }
    } catch (e) {
      console.error('Error loading database:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatabase();
  }, [loadDatabase]);

  const handleResetDatabase = async () => {
    try {
      setIsLoading(true);
      await DatabaseService.clearAllData();
      const defaultClass = DatabaseService.createDefaultClass();
      await DatabaseService.saveClass(defaultClass);
      setAllClasses([defaultClass]);
      setCurrentClass(defaultClass);
      DatabaseService.setActiveId(defaultClass.summary.id);
      setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error('Error resetting database:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save helper with debounce to prevent excessive writes
  const triggerAutoSave = useCallback((updatedData: FullClassData) => {
    setCurrentClass(updatedData);
    setAllClasses(prev => prev.map(c => c.summary.id === updatedData.summary.id ? updatedData : c));

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await DatabaseService.saveClass(updatedData);
        setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.error('Auto-save error:', err);
      } finally {
        setIsSaving(false);
      }
    }, 600);
  }, []);

  // Handler for class summary updates (School info, L, P count, signature, statement)
  const handleUpdateSummary = (updatedSummary: Partial<ClassSummary>) => {
    if (!currentClass) return;
    const newData: FullClassData = {
      ...currentClass,
      summary: {
        ...currentClass.summary,
        ...updatedSummary
      }
    };
    triggerAutoSave(newData);
  };

  // Student CRUD
  const handleSaveStudent = (student: StudentEntry) => {
    if (!currentClass) return;
    const existingIndex = currentClass.students.findIndex(s => s.id === student.id);
    let updatedStudents: StudentEntry[];
    if (existingIndex >= 0) {
      updatedStudents = [...currentClass.students];
      updatedStudents[existingIndex] = student;
    } else {
      updatedStudents = [student, ...currentClass.students];
    }

    const newData: FullClassData = {
      ...currentClass,
      students: updatedStudents
    };
    triggerAutoSave(newData);
  };

  const handleDeleteStudent = (id: string) => {
    if (!currentClass) return;
    const std = currentClass.students.find(s => s.id === id);
    if (confirm(`Yakin ingin menghapus data siswa ${std?.name || ''}?`)) {
      const updatedStudents = currentClass.students.filter(s => s.id !== id);
      const newData: FullClassData = {
        ...currentClass,
        students: updatedStudents
      };
      triggerAutoSave(newData);
    }
  };

  // Document management
  const handleAddDocument = (doc: DocumentProof, targetStudentId?: string) => {
    if (!currentClass) return;
    if (targetStudentId) {
      const updatedStudents = currentClass.students.map(s => {
        if (s.id === targetStudentId) {
          return {
            ...s,
            documents: [...(s.documents || []), doc]
          };
        }
        return s;
      });
      triggerAutoSave({
        ...currentClass,
        students: updatedStudents
      });
    } else {
      triggerAutoSave({
        ...currentClass,
        generalDocuments: [doc, ...(currentClass.generalDocuments || [])]
      });
    }
  };

  const handleDeleteDocument = (docId: string, studentId?: string) => {
    if (!currentClass) return;
    if (studentId) {
      const updatedStudents = currentClass.students.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            documents: (s.documents || []).filter(d => d.id !== docId)
          };
        }
        return s;
      });
      triggerAutoSave({
        ...currentClass,
        students: updatedStudents
      });
    } else {
      triggerAutoSave({
        ...currentClass,
        generalDocuments: (currentClass.generalDocuments || []).filter(d => d.id !== docId)
      });
    }
  };

  const handleUpdateDocStatus = (docId: string, newStatus: VerificationStatus, studentId?: string) => {
    if (!currentClass) return;
    if (studentId) {
      const updatedStudents = currentClass.students.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            documents: (s.documents || []).map(d => d.id === docId ? { ...d, status: newStatus } : d)
          };
        }
        return s;
      });
      triggerAutoSave({
        ...currentClass,
        students: updatedStudents
      });
    } else {
      triggerAutoSave({
        ...currentClass,
        generalDocuments: (currentClass.generalDocuments || []).map(d => d.id === docId ? { ...d, status: newStatus } : d)
      });
    }
  };

  // Class selection & creation
  const handleSelectClass = async (id: string) => {
    const selected = allClasses.find(c => c.summary.id === id);
    if (selected) {
      setCurrentClass(selected);
      DatabaseService.setActiveId(id);
    }
  };

  const handleNewClass = async () => {
    const defaultClass = DatabaseService.createDefaultClass();
    defaultClass.summary.id = 'class_' + Date.now();
    defaultClass.summary.className = 'Kelas Baru ' + (allClasses.length + 1);
    defaultClass.summary.maleCount = 0;
    defaultClass.summary.femaleCount = 0;
    defaultClass.summary.signatureDataUrl = '';
    defaultClass.students = [];
    defaultClass.generalDocuments = [];

    await DatabaseService.saveClass(defaultClass);
    setAllClasses(prev => [defaultClass, ...prev]);
    setCurrentClass(defaultClass);
    DatabaseService.setActiveId(defaultClass.summary.id);
  };

  const handleDeleteClass = async (id: string) => {
    const target = allClasses.find(c => c.summary.id === id);
    if (confirm(`Yakin ingin menghapus data rekapitulasi Kelas ${target?.summary.className || ''}?`)) {
      await DatabaseService.deleteClass(id);
      const updated = allClasses.filter(c => c.summary.id !== id);
      setAllClasses(updated);
      if (updated.length > 0) {
        setCurrentClass(updated[0]);
        DatabaseService.setActiveId(updated[0].summary.id);
      } else {
        handleNewClass();
      }
    }
  };

  const handleSaveRecord = async () => {
    if (!currentClass) return;
    setIsSaving(true);
    try {
      const toSave: FullClassData = {
        ...currentClass,
        summary: {
          ...currentClass.summary,
          updatedAt: new Date().toISOString(),
          signedAt: currentClass.summary.signedAt || new Date().toISOString()
        }
      };
      await DatabaseService.saveClass(toSave);
      setCurrentClass(toSave);
      setAllClasses(prev => {
        const index = prev.findIndex(c => c.summary.id === toSave.summary.id);
        if (index >= 0) {
          const clone = [...prev];
          clone[index] = toSave;
          return clone;
        }
        return [toSave, ...prev];
      });
      setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error saving record:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !currentClass) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md animate-bounce">
            <GraduationCap className="w-7 h-7" />
          </div>
          <p className="font-bold text-slate-800 text-sm">
            Memuat Data Basis Data Wali Kelas...
          </p>
          <p className="text-xs text-slate-400">
            Menginisialisasi penyimpanan lokal yang aman
          </p>
        </div>
      </div>
    );
  }

  const totalStudents = Number(currentClass.summary.maleCount) + Number(currentClass.summary.femaleCount);
  const totalUploadedDocuments = (currentClass.generalDocuments?.length || 0) + 
    currentClass.students.reduce((acc, s) => acc + (s.documents?.length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Sticky Navbar */}
      <Navbar
        currentClass={currentClass}
        allClasses={allClasses}
        onSelectClass={handleSelectClass}
        onNewClass={handleNewClass}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        lastSavedTime={lastSavedTime}
        isSaving={isSaving}
      />

      {/* Hero Banner / Quick Info bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800">
                  {currentClass.summary.academicYear} • Semester {currentClass.summary.semester}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-300">
                  {currentClass.summary.schoolName || 'Satuan Pendidikan'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
                Rekapitulasi Kelas {currentClass.summary.className || 'Rombel'}
              </h1>
            </div>

            {/* Quick Metrics Header */}
            <div className="flex items-center gap-3 bg-slate-800/80 p-2 sm:p-2.5 rounded-xl border border-slate-700">
              <div className="text-center px-3 border-r border-slate-700">
                <span className="block text-[10px] text-blue-300 font-bold uppercase">Laki-Laki</span>
                <span className="text-lg font-extrabold text-white">{currentClass.summary.maleCount}</span>
              </div>
              <div className="text-center px-3 border-r border-slate-700">
                <span className="block text-[10px] text-rose-300 font-bold uppercase">Perempuan</span>
                <span className="text-lg font-extrabold text-white">{currentClass.summary.femaleCount}</span>
              </div>
              <div className="text-center px-3">
                <span className="block text-[10px] text-emerald-300 font-bold uppercase">Total Siswa</span>
                <span className="text-lg font-extrabold text-emerald-400">{totalStudents}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 flex-1 w-full">
        
        {/* Section 1: Identitas & Input Jumlah Siswa (L, P, Auto-Sum) & Riwayat */}
        <section id="section-summary">
          <ClassSummaryCard
            summary={currentClass.summary}
            students={currentClass.students}
            onChange={handleUpdateSummary}
            historyList={allClasses.filter(c => Boolean(c.summary.signatureDataUrl))}
            currentClassId={currentClass.summary.id}
            onSelectHistoryClass={handleSelectClass}
            onDeleteHistoryClass={handleDeleteClass}
          />
        </section>

        {/* Section 2: Data Siswa Baru , Siswa Pindahan (Mutasi) & Siswa Keluar (Drop Out) */}
        <section id="section-students">
          <StudentListSection
            students={currentClass.students}
            onAddStudent={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            onEditStudent={(std) => {
              setEditingStudent(std);
              setIsStudentModalOpen(true);
            }}
            onDeleteStudent={handleDeleteStudent}
            onPreviewDoc={(doc) => setPreviewDoc(doc)}
          />
        </section>

        {/* Section 3: Upload Bukti Data Siswa Valid (Surat Pindah, KK, Akta) */}
        <section id="section-documents">
          <DocumentUploadSection
            students={currentClass.students}
            generalDocuments={currentClass.generalDocuments || []}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onUpdateDocStatus={handleUpdateDocStatus}
            onPreviewDoc={(doc) => setPreviewDoc(doc)}
          />
        </section>

        {/* Section 4: Surat Pernyataan Keabsahan Data & Tanda Tangan Digital dengan Pena */}
        <section id="section-statement">
          <StatementSignatureSection
            summary={currentClass.summary}
            totalStudents={totalStudents}
            totalUploadedDocuments={totalUploadedDocuments}
            onUpdateSummary={handleUpdateSummary}
            onSaveRecord={handleSaveRecord}
            isSaving={isSaving}
          />
        </section>

        {/* Section 5: Ekspor Rekapitulasi Data (PDF & Excel) */}
        <section id="section-export">
          <ExportSection
            data={currentClass}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            Aplikasi Rekapitulasi Data Wali Kelas • Dilengkapi Sistem Basis Data & Tanda Tangan Digital
          </p>
          <p className="text-slate-400">
            Semua data tersimpan secara aman di penyimpanan browser lokal perangkat Anda (IndexedDB).
          </p>
        </div>
      </footer>

      {/* Modals */}
      <StudentFormModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        initialData={editingStudent}
        defaultClassName={currentClass.summary.className || 'Kelas Baru'}
      />

      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onUpdateStatus={(newStatus) => {
          if (previewDoc) {
            handleUpdateDocStatus(previewDoc.id, newStatus, previewDoc.studentId);
            setPreviewDoc({ ...previewDoc, status: newStatus });
          }
        }}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        allClasses={allClasses}
        currentClassId={currentClass.summary.id}
        onSelectClass={handleSelectClass}
        onNewClass={handleNewClass}
        onDeleteClass={handleDeleteClass}
        onRefreshData={loadDatabase}
        onResetDatabase={handleResetDatabase}
      />

    </div>
  );
}
