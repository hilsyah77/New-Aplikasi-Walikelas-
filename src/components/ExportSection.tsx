import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  AlertTriangle
} from 'lucide-react';
import { FullClassData } from '../types';
import { exportClassDataToPDF } from '../services/pdfExport';
import { exportClassDataToExcel } from '../services/excelExport';

interface ExportSectionProps {
  data: FullClassData;
}

export const ExportSection: React.FC<ExportSectionProps> = ({ data }) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { summary } = data;
  const hasSignature = Boolean(summary.signatureDataUrl);

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      await new Promise(r => setTimeout(r, 300));
      exportClassDataToPDF(data);
      setSuccessMsg('Dokumen Rekapitulasi PDF berhasil diunduh!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error('Export PDF error:', e);
      alert('Gagal mengekspor PDF: ' + e.message);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      await new Promise(r => setTimeout(r, 300));
      exportClassDataToExcel(data);
      setSuccessMsg('File Spreadsheet Excel (.xlsx) berhasil diunduh!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error('Export Excel error:', e);
      alert('Gagal mengekspor Excel: ' + e.message);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Section Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Ekspor Rekapitulasi Data (PDF & Excel)
            </h2>
            <p className="text-xs text-slate-500">
              Unduh berkas resmi laporan rekapitulasi data siswa siap cetak (PDF) dan olah data spreadsheet (Excel)
            </p>
          </div>
        </div>

        {/* Validation badge */}
        {!hasSignature && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" />
            Tanda tangan belum dibubuhkan
          </span>
        )}
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        
        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Action Buttons Only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tombol Ekspor PDF */}
          <button
            id="btn-export-pdf"
            type="button"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="w-full py-3.5 px-5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            {isExportingPDF ? 'Sedang Memproses PDF...' : 'Ekspor Laporan Format PDF'}
          </button>

          {/* Tombol Ekspor Excel */}
          <button
            id="btn-export-excel"
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {isExportingExcel ? 'Sedang Memproses Excel...' : 'Ekspor Format Excel (.xlsx)'}
          </button>
        </div>

      </div>
    </div>
  );
};

