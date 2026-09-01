export type Gender = 'L' | 'P';

export type StudentStatus = 'Siswa Baru' | 'Siswa Pindahan (Masuk)' | 'Siswa Pindahan (Keluar)' | 'Siswa Keluar (Drop Out)' | 'Siswa Reguler';

export type DocumentType = 'Surat Keterangan Pindah' | 'Kartu Keluarga (KK)' | 'Akta Kelahiran' | 'Rapor Asal' | 'Ijazah/SKL' | 'Lainnya';

export type VerificationStatus = 'Valid / Terverifikasi' | 'Menunggu Verifikasi' | 'Perlu Perbaikan';

export interface DocumentProof {
  id: string;
  studentId?: string;
  studentName?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  documentType: DocumentType;
  uploadedAt: string;
  dataUrl: string; // Base64 data url for preview and persistence
  status: VerificationStatus;
  notes?: string;
}

export interface StudentEntry {
  id: string;
  name: string;
  nisn: string;
  nis?: string;
  gender: Gender;
  status: StudentStatus;
  targetClass: string;
  originSchool?: string;
  entryDate: string;
  contactNumber?: string;
  parentName?: string;
  address?: string;
  notes?: string;
  documents: DocumentProof[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassSummary {
  id: string;
  schoolName: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  className: string;
  teacherName: string;
  teacherNip?: string;
  
  // Manual / baseline counts
  maleCount: number;
  femaleCount: number;
  
  // Statement and signature
  statementPlace: string;
  statementDate: string;
  statementAgreed: boolean;
  signatureDataUrl?: string;
  signedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface FullClassData {
  summary: ClassSummary;
  students: StudentEntry[];
  generalDocuments: DocumentProof[];
}

export interface DatabaseBackup {
  version: string;
  exportedAt: string;
  appName: string;
  data: FullClassData[];
}
