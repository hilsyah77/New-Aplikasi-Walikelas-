import React, { useState } from 'react';
import { 
  FileCheck, 
  Upload, 
  Trash2, 
  Eye, 
  FileText, 
  FileImage,
  Plus
} from 'lucide-react';
import { DocumentProof, StudentEntry } from '../types';

interface DocumentUploadSectionProps {
  students: StudentEntry[];
  generalDocuments: DocumentProof[];
  onAddDocument: (doc: DocumentProof, targetStudentId?: string) => void;
  onDeleteDocument: (docId: string, studentId?: string) => void;
  onUpdateDocStatus?: (docId: string, newStatus: any, studentId?: string) => void;
  onPreviewDoc: (doc: DocumentProof) => void;
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  students,
  generalDocuments,
  onAddDocument,
  onDeleteDocument,
  onPreviewDoc
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Collect all documents across students and general
  const allDocumentsWithMeta = React.useMemo(() => {
    const list: { doc: DocumentProof; studentId?: string; studentName?: string }[] = [];

    // General docs
    generalDocuments.forEach(doc => {
      list.push({
        doc,
        studentId: undefined,
        studentName: 'Dokumen Umum / Lampiran Kelas'
      });
    });

    // Student docs
    students.forEach(std => {
      if (std.documents && std.documents.length > 0) {
        std.documents.forEach(d => {
          list.push({
            doc: d,
            studentId: std.id,
            studentName: std.name
          });
        });
      }
    });

    return list;
  }, [students, generalDocuments]);

  const handleProcessFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      const newDoc: DocumentProof = {
        id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentType: 'Surat Keterangan Pindah',
        uploadedAt: new Date().toISOString(),
        dataUrl,
        status: 'Valid / Terverifikasi',
        notes: ''
      };

      onAddDocument(newDoc, undefined);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Section Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Upload Bukti Data Siswa Valid
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Wajib Diunggah
              </span>
            </div>
            <p className="text-xs text-slate-300">
              unggah daftar siswa valid, Daftar nilai atau daftar hadir di foto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
            {allDocumentsWithMeta.length} Berkas Tersimpan
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        
        {/* Upload Form Box - Simple Direct Upload */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : 'border-slate-300 bg-white hover:border-emerald-400'
            }`}
          >
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Tarik & Lepas File Berkas di Sini
              </p>
              <p className="text-xs text-slate-500">
                Mendukung foto daftar nilai/hadir, berkas scan JPG, PNG, PDF
              </p>
              <div className="pt-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors">
                  <Plus className="w-4 h-4" />
                  Pilih File Dari Perangkat
                  <input
                    id="input-doc-file-picker"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Gallery / List of Uploaded Documents */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Daftar Bukti Dokumen Terlampir ({allDocumentsWithMeta.length})
            </h3>
          </div>

          {allDocumentsWithMeta.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allDocumentsWithMeta.map(({ doc, studentId, studentName }) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 truncate">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                          {doc.fileType.startsWith('image/') ? (
                            <FileImage className="w-4 h-4 text-blue-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-slate-900 text-xs truncate" title={doc.fileName}>
                            {doc.fileName}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-500">
                            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('id-ID') : '-'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteDocument(doc.id, studentId)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Hapus Bukti"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {studentId && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mb-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Siswa Terkait:</span>
                        <span className="font-semibold text-slate-800">{studentName}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Preview */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onPreviewDoc(doc)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat Bukti
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500">
              <FileCheck className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Belum ada berkas bukti yang diunggah
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Unggah bukti mutasi siswa seperti Surat Pindah atau Kartu Keluarga menggunakan form di atas
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
