import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, auth } from '../firebase';
import { FullClassData } from '../types';
import { handleFirestoreError, OperationType } from './firestoreErrors';

const CLASSES_COLLECTION = 'classes';
const USERS_COLLECTION = 'users';

export class FirebaseDbService {
  /**
   * Sync or save user profile to Firestore
   */
  public static async saveUserProfile(user: User): Promise<void> {
    const path = `${USERS_COLLECTION}/${user.uid}`;
    try {
      await setDoc(
        doc(db, USERS_COLLECTION, user.uid),
        {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Save or update class data in Firestore
   */
  public static async saveClass(classData: FullClassData, userId?: string): Promise<void> {
    const classId = classData.summary.id;
    const path = `${CLASSES_COLLECTION}/${classId}`;
    const uid = userId || auth.currentUser?.uid || 'anonymous';

    try {
      const payload = {
        id: classId,
        schoolName: classData.summary.schoolName || '',
        academicYear: classData.summary.academicYear || '',
        semester: classData.summary.semester || 'Ganjil',
        className: classData.summary.className || '',
        teacherName: classData.summary.teacherName || '',
        teacherNip: classData.summary.teacherNip || '',
        maleCount: Number(classData.summary.maleCount) || 0,
        femaleCount: Number(classData.summary.femaleCount) || 0,
        statementPlace: classData.summary.statementPlace || '',
        statementDate: classData.summary.statementDate || '',
        statementAgreed: Boolean(classData.summary.statementAgreed),
        signatureDataUrl: classData.summary.signatureDataUrl || '',
        signedAt: classData.summary.signedAt || '',
        summary: classData.summary,
        students: classData.students || [],
        generalDocuments: classData.generalDocuments || [],
        userId: uid,
        updatedAt: new Date().toISOString(),
        createdAt: classData.summary.createdAt || new Date().toISOString()
      };

      await setDoc(doc(db, CLASSES_COLLECTION, classId), payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Get all classes from Firestore for current user or all available
   */
  public static async getAllClasses(userId?: string): Promise<FullClassData[]> {
    const path = CLASSES_COLLECTION;
    try {
      const colRef = collection(db, CLASSES_COLLECTION);
      let q = query(colRef);
      if (userId) {
        q = query(colRef, where('userId', '==', userId));
      }
      
      const snap = await getDocs(q);
      const classes: FullClassData[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.summary) {
          classes.push({
            summary: data.summary,
            students: data.students || [],
            generalDocuments: data.generalDocuments || []
          });
        }
      });

      return classes;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  /**
   * Delete class from Firestore
   */
  public static async deleteClass(classId: string): Promise<void> {
    const path = `${CLASSES_COLLECTION}/${classId}`;
    try {
      await deleteDoc(doc(db, CLASSES_COLLECTION, classId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Listen to real-time changes
   */
  public static subscribeToClasses(
    onData: (classes: FullClassData[]) => void,
    userId?: string
  ): () => void {
    const path = CLASSES_COLLECTION;
    const colRef = collection(db, CLASSES_COLLECTION);
    const q = userId ? query(colRef, where('userId', '==', userId)) : query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const classes: FullClassData[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.summary) {
            classes.push({
              summary: data.summary,
              students: data.students || [],
              generalDocuments: data.generalDocuments || []
            });
          }
        });
        onData(classes);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return unsubscribe;
  }
}
