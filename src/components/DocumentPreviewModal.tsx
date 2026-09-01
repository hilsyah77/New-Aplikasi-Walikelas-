import React from 'react';
import { 
  X, 
  Download, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  User, 
  FileImage,
  ExternalLink
} from 'lucide-react';
import { DocumentProof, VerificationStatus } from '../types';

interface DocumentPreviewModalProps {
  document: DocumentProof | null;
  onClose: () => void;
  onUpdateStatus?: (newStatus: VerificationStatus) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  onUpdateStatus
}) => {
  if (!document) return null;

  const isImage = document.fileType.startsWith('image/') || document.dataUrl.startsWith('data:image');
  const isPdf = document.fileType.includes('pdf') || document.dataUrl.startsWith('data:application/pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="p-2 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-base truncate" title={document.fileName}>
                {document.fileName}
              </h3>
              <p className="text-xs text-slate-300">
                {document.documentType} • {document.studentName || 'Dokumen Kelas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={document.dataUrl}
              download={document.fileName}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Unduh Berkas Ini"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center min-h-[300px]">
          {isImage ? (
            <div className="max-w-full max-h-[500px] flex items-center justify-center rounded-xl overflow-hidden shadow-sm bg-white p-2 border border-slate-200">
              <img
                src={document.dataUrl}
                alt={document.fileName}
                referrerPolicy="no-referrer"
                className="max-h-[460px] max-w-full object-contain rounded-lg"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={document.dataUrl}
              title={document.fileName}
              className="w-full h-[450px] rounded-xl border border-slate-200 bg-white"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-md shadow-xs">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm mb-1">{document.fileName}</h4>
              <p className="text-xs text-slate-500 mb-4">
                Tipe file: {document.fileType || 'Dokumen Berkas'} ({(document.fileSize / 1024).toFixed(1)} KB)
              </p>
              <a
                href={document.dataUrl}
                download={document.fileName}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <Download className="w-4 h-4" />
                Unduh Berkas untuk Membuka
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer Metadata & Status Controls */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 space-y-0.5">
            <div>
              <span className="font-semibold">Status Validasi:</span>{' '}
              <span className={`inline-block font-bold px-2 py-0.5 rounded text-[11px] ${
                document.status === 'Valid / Terverifikasi'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : document.status === 'Menunggu Verifikasi'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {document.status}
              </span>
            </div>
            {document.notes && (
              <p className="text-slate-500 italic text-[11px]">
                Catatan: "{document.notes}"
              </p>
            )}
          </div>

          {onUpdateStatus && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Ubah Status:</span>
              <select
                id="preview-change-status"
                value={document.status}
                onChange={(e) => onUpdateStatus(e.target.value as VerificationStatus)}
                className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Valid / Terverifikasi">Valid / Terverifikasi</option>
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
              </select>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
