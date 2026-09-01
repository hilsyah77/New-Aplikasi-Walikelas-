import React, { useRef, useState, useEffect } from 'react';
import { 
  FileSignature, 
  RotateCcw, 
  Check, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  PenTool,
  Eraser,
  Sparkles,
  Save,
  Clock
} from 'lucide-react';
import { ClassSummary } from '../types';

interface StatementSignatureSectionProps {
  summary: ClassSummary;
  totalStudents: number;
  onUpdateSummary: (updated: Partial<ClassSummary>) => void;
  onSaveRecord?: () => void;
  isSaving?: boolean;
  totalUploadedDocuments?: number;
}

export const StatementSignatureSection: React.FC<StatementSignatureSectionProps> = ({
  summary,
  totalStudents,
  onUpdateSummary,
  onSaveRecord,
  isSaving = false,
  totalUploadedDocuments = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e293b'); // Dark formal ink
  const [penSize, setPenSize] = useState(2.0);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [hasSignature, setHasSignature] = useState(Boolean(summary.signatureDataUrl));
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution for crisp signature
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Only resize if needed
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If existing signature exists, load it onto canvas
    if (summary.signatureDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = summary.signatureDataUrl;
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
      setHasSignature(false);
    }
  }, [summary.signatureDataUrl]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setStrokeHistory(prev => [...prev.slice(-10), state]);
    } catch (e) {
      // ignore
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveCanvasState();
    setIsDrawing(true);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Auto-save signature data URL
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onUpdateSummary({
      signatureDataUrl: dataUrl,
      signedAt: new Date().toISOString()
    });
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeHistory([]);
    setHasSignature(false);
    onUpdateSummary({
      signatureDataUrl: '',
      signedAt: undefined
    });
  };

  const handleUndo = () => {
    if (strokeHistory.length === 0) {
      handleClear();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...strokeHistory];
    const previousState = newHistory.pop();
    setStrokeHistory(newHistory);

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      onUpdateSummary({
        signatureDataUrl: dataUrl,
        signedAt: new Date().toISOString()
      });
    }
  };

  // Validation requirements
  const hasStudentCounts = ((Number(summary.maleCount) || 0) + (Number(summary.femaleCount) || 0)) > 0 || totalStudents > 0;
  const hasUploadedDocuments = (totalUploadedDocuments || 0) > 0;
  const hasDigitalSignature = Boolean(hasSignature || summary.signatureDataUrl);

  const isReadyToSave = hasStudentCounts && hasUploadedDocuments && hasDigitalSignature;
  const requirementsMetCount = (hasStudentCounts ? 1 : 0) + (hasUploadedDocuments ? 1 : 0) + (hasDigitalSignature ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Section Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Pernyataan Keabsahan Data & Tanda Tangan Digital
            </h2>
            <p className="text-xs text-slate-300">
              Pengesahan resmi wali kelas menggunakan pena digital interaktif langsung pada layar
            </p>
          </div>
        </div>

        <div>
          {summary.signatureDataUrl ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Sudah Ditandatangani
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Menunggu Tanda Tangan
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        
        {/* Surat Pernyataan Text Box */}
        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <FileSignature className="w-4 h-4 text-amber-700" />
            SURAT PERNYATAAN KEABSAHAN DATA WALI KELAS
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            "Saya yang bertanda tangan di bawah ini, Wali Kelas{' '}
            <strong className="text-slate-900 font-bold">{summary.className || '[Nama Kelas]'}</strong>{' '}
            pada satuan pendidikan{' '}
            <strong className="text-slate-900 font-bold">{summary.schoolName || '[Nama Sekolah]'}</strong>,{' '}
            menyatakan dengan sesungguhnya bahwa data rekapitulasi jumlah siswa sebanyak{' '}
            <strong className="text-blue-700 font-bold">{totalStudents} Siswa</strong> ({summary.maleCount} Laki-laki dan {summary.femaleCount} Perempuan),{' '}
            serta data siswa baru/pindahan dan berkas bukti validasi terlampir adalah benar, sah, dan sesuai dengan keadaan administrasi kelas yang sebenarnya."
          </p>

          <div className="pt-2 flex items-center gap-2">
            <input
              id="checkbox-statement-agreed"
              type="checkbox"
              checked={summary.statementAgreed}
              onChange={(e) => onUpdateSummary({ statementAgreed: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="checkbox-statement-agreed" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Saya menyetujui pernyataan keabsahan data di atas dan bertanggung jawab penuh atas kebenaran data ini.
            </label>
          </div>
        </div>

        {/* Place & Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Tempat / Kota Pengesahan
            </label>
            <input
              id="input-statement-place"
              type="text"
              value={summary.statementPlace}
              onChange={(e) => onUpdateSummary({ statementPlace: e.target.value })}
              placeholder="Contoh: Jakarta / Surabaya / Bandung"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Tanggal Pengesahan
            </label>
            <input
              id="input-statement-date"
              type="date"
              value={summary.statementDate}
              onChange={(e) => onUpdateSummary({ statementDate: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Canvas Tanda Tangan Digital dengan Pena (Compact & Precision) */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-blue-600" />
                Kolom Tanda Tangan Digital
              </label>
              <p className="text-[11px] text-slate-500">
                Goreskan tanda tangan menggunakan sentuhan jari atau kursor mouse
              </p>
            </div>

            {/* Pen Color & Thickness Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Color Choices */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPenColor('#0f172a')}
                  className={`w-4.5 h-4.5 rounded-full bg-slate-900 border transition-all cursor-pointer ${
                    penColor === '#0f172a' ? 'border-blue-600 scale-110 shadow-xs' : 'border-transparent'
                  }`}
                  title="Tinta Hitam Formal"
                />
                <button
                  type="button"
                  onClick={() => setPenColor('#1d4ed8')}
                  className={`w-4.5 h-4.5 rounded-full bg-blue-700 border transition-all cursor-pointer ${
                    penColor === '#1d4ed8' ? 'border-blue-600 scale-110 shadow-xs' : 'border-transparent'
                  }`}
                  title="Tinta Biru Formal"
                />
              </div>

              {/* Thickness Selector */}
              <select
                id="select-pen-size"
                aria-label="Ketebalan Pena"
                value={penSize}
                onChange={(e) => setPenSize(parseFloat(e.target.value))}
                className="text-[11px] bg-white text-slate-700 px-2 py-1 rounded-lg border border-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="1.5">Pena 1.5px</option>
                <option value="2.0">Pena 2.0px</option>
                <option value="3.0">Pena 3.0px</option>
              </select>

              {/* Undo Button */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={strokeHistory.length === 0}
                className="p-1 text-xs text-slate-600 bg-white hover:bg-slate-100 disabled:opacity-40 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                title="Urungkan goresan terakhir"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Clear Button */}
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg font-semibold border border-rose-200 transition-colors cursor-pointer"
                title="Hapus tanda tangan"
              >
                <Eraser className="w-3 h-3" />
                Reset
              </button>
            </div>
          </div>

          {/* Precision 200x200 Pixel Signature Box */}
          <div className="flex flex-col items-center justify-center pt-2 pb-2">
            <div className="relative w-[200px] h-[200px] border-2 border-dashed border-slate-400 hover:border-blue-500 rounded-xl bg-white overflow-hidden shadow-xs transition-colors shrink-0">
              
              {/* Bottom Guide Line */}
              <div className="absolute inset-x-3 bottom-3 border-b border-dashed border-slate-300 pointer-events-none flex justify-between text-[9px] text-slate-400 select-none">
                <span>(Tanda Tangan)</span>
                <span>Wali Kelas</span>
              </div>

              <canvas
                ref={canvasRef}
                style={{ width: '200px', height: '200px', touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-[200px] h-[200px] cursor-crosshair block bg-transparent"
              />

              {!hasSignature && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 p-2 text-center select-none">
                  <PenTool className="w-5 h-5 text-slate-300 mb-1" />
                  <span className="text-xs font-medium text-slate-500">Bubuhkan Tanda Tangan</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Ukuran: 200 x 200 px</span>
                </div>
              )}
            </div>

            {/* Signee Metadata Line */}
            <div className="mt-2.5 text-center text-xs text-slate-600">
              <span className="font-bold text-slate-800">{summary.teacherName || 'Wali Kelas'}</span>
              {summary.signedAt && (
                <div className="text-emerald-700 font-semibold text-[11px] flex items-center justify-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ditandatangani {new Date(summary.signedAt).toLocaleDateString('id-ID')}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Persyaratan Kelengkapan Validasi Sebelum Simpan */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isReadyToSave 
            ? 'bg-emerald-50/60 border-emerald-200' 
            : 'bg-amber-50/60 border-amber-200'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isReadyToSave ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <h4 className="text-xs font-bold text-slate-800">
                Status Syarat Pengesahan & Penyimpanan Data ({requirementsMetCount}/3 Terpenuhi)
              </h4>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              isReadyToSave 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {isReadyToSave ? 'Siap Disimpan (Tombol Aktif)' : 'Lengkapi 3 Syarat Wajib'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Syarat 1: Input Jumlah Siswa */}
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              hasStudentCounts 
                ? 'bg-white border-emerald-200 text-emerald-900' 
                : 'bg-white border-rose-200 text-rose-800'
            }`}>
              {hasStudentCounts ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[11px] truncate">1. Input Jumlah Siswa</p>
                <p className="text-[10px] text-slate-500">
                  {hasStudentCounts ? `Terisi: ${totalStudents} Siswa` : 'Wajib Diisi (Masih 0)'}
                </p>
              </div>
            </div>

            {/* Syarat 2: Upload Bukti Data Siswa */}
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              hasUploadedDocuments 
                ? 'bg-white border-emerald-200 text-emerald-900' 
                : 'bg-white border-rose-200 text-rose-800'
            }`}>
              {hasUploadedDocuments ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[11px] truncate">2. Bukti Data Valid</p>
                <p className="text-[10px] text-slate-500">
                  {hasUploadedDocuments ? `Terunggah: ${totalUploadedDocuments} Berkas` : 'Wajib Upload Berkas'}
                </p>
              </div>
            </div>

            {/* Syarat 3: Tanda Tangan Digital */}
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              hasDigitalSignature 
                ? 'bg-white border-emerald-200 text-emerald-900' 
                : 'bg-white border-rose-200 text-rose-800'
            }`}>
              {hasDigitalSignature ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[11px] truncate">3. Tanda Tangan Digital</p>
                <p className="text-[10px] text-slate-500">
                  {hasDigitalSignature ? 'Sudah Ditandatangani' : 'Wajib Goreskan TTD'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Feedback Messages */}
        {saveSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">{saveSuccessMessage}</p>
              <p className="text-[11px] text-emerald-600 font-normal mt-0.5">
                Data telah dicatat dalam tabel "Riwayat Input Data Rekapitulasi" di bagian atas.
              </p>
            </div>
          </div>
        )}

        {saveErrorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p>{saveErrorMessage}</p>
          </div>
        )}

        {/* Action Save Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500 max-w-md">
            <span className="font-bold text-slate-700">Petunjuk Penyimpanan:</span>{' '}
            {!isReadyToSave ? (
              <span className="text-rose-600 font-medium">
                Tombol simpan saat ini non-aktif. Pastikan Jumlah Siswa telah diisi, Bukti Berkas telah diunggah, dan Tanda Tangan digital telah dibubuhkan.
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">
                Semua syarat telah terpenuhi! Klik tombol di sebelah kanan untuk menyimpan data rekapitulasi ke riwayat.
              </span>
            )}
          </div>

          <button
            id="btn-save-signature-data"
            type="button"
            onClick={() => {
              setSaveSuccessMessage(null);
              setSaveErrorMessage(null);

              if (!hasStudentCounts) {
                setSaveErrorMessage('Input Jumlah Siswa (Laki-laki / Perempuan) wajib diisi terlebih dahulu!');
                return;
              }

              if (!hasUploadedDocuments) {
                setSaveErrorMessage('Upload Bukti Data Siswa Valid wajib diisi/diunggah minimal 1 berkas bukti!');
                return;
              }

              const canvas = canvasRef.current;
              let currentSig = summary.signatureDataUrl;
              if (canvas && hasSignature && !currentSig) {
                currentSig = canvas.toDataURL('image/png');
                onUpdateSummary({
                  signatureDataUrl: currentSig,
                  signedAt: new Date().toISOString(),
                  statementAgreed: true
                });
              }

              if (!hasSignature && !currentSig) {
                setSaveErrorMessage('Tanda tangan digital wajib dibubuhkan pada kotak kanvas terlebih dahulu sebelum menyimpan data!');
                return;
              }

              if (!summary.statementAgreed) {
                onUpdateSummary({ statementAgreed: true });
              }

              if (onSaveRecord) {
                onSaveRecord();
                setSaveSuccessMessage(`Data rekapitulasi Kelas ${summary.className || ''} dan tanda tangan digital berhasil disimpan ke Riwayat!`);
              }
            }}
            disabled={!isReadyToSave || isSaving}
            className={`inline-flex items-center gap-2 px-6 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all ${
              isReadyToSave && !isSaving
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transform active:scale-98 cursor-pointer'
                : 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed'
            }`}
            title={!isReadyToSave ? 'Lengkapi Jumlah Siswa, Upload Bukti, dan Tanda Tangan untuk mengaktifkan tombol' : 'Simpan data ke riwayat'}
          >
            <Save className="w-4 h-4" />
            {isSaving 
              ? 'Menyimpan...' 
              : !isReadyToSave 
                ? 'Tombol Simpan Non-Aktif' 
                : 'Simpan Data Rekapitulasi & Tanda Tangan'
            }
          </button>
        </div>

      </div>
    </div>
  );
};
