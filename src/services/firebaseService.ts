import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../config/firebase';
import { Loan } from '../types/loan';

export interface FirebaseLoan extends Omit<Loan, 'id'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

export class FirebaseService {
  private static instance: FirebaseService;
  private loansCollection = 'loans';
  private usersCollection = 'users';

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // Authentication methods
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      // Create user document in Firestore
      await addDoc(collection(db, this.usersCollection), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName,
        role: 'member',
        createdAt: Timestamp.now()
      });
      
      return userCredential.user;
    } catch (error: any) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Loan CRUD operations
  async createLoan(loan: Omit<FirebaseLoan, 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // MOCK: Return a mock ID for now
      const mockId = `mock-loan-${Date.now()}`;
      console.log('[MOCK] Creating loan:', loan);
      return mockId;
      
      // PRODUCTION CODE (commented for mock):
      // const docRef = await addDoc(collection(db, this.loansCollection), {
      //   ...loan,
      //   createdAt: Timestamp.now(),
      //   updatedAt: Timestamp.now()
      // });
      // return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to create loan: ${error.message}`);
    }
  }

  async getLoans(userId?: string, pageSize: number = 10, lastDoc?: DocumentSnapshot): Promise<{
    loans: Loan[];
    lastDocument: DocumentSnapshot | null;
  }> {
    try {
      // MOCK: Return mock data
      const { generateMockLoans } = await import('./mockFirebaseData');
      const mockLoans = generateMockLoans(pageSize);
      console.log('[MOCK] Fetching loans:', mockLoans.length);
      return { loans: mockLoans, lastDocument: null };
      
      // PRODUCTION CODE (commented for mock):
      // let q = query(
      //   collection(db, this.loansCollection),
      //   orderBy('createdAt', 'desc'),
      //   limit(pageSize)
      // );

      // if (userId) {
      //   q = query(
      //     collection(db, this.loansCollection),
      //     where('userId', '==', userId),
      //     orderBy('createdAt', 'desc'),
      //     limit(pageSize)
      //   );
      // }

      // if (lastDoc) {
      //   q = query(q, startAfter(lastDoc));
      // }

      // const querySnapshot = await getDocs(q);
      // const loans: Loan[] = [];
      // let lastDocument: DocumentSnapshot | null = null;

      // querySnapshot.forEach((doc) => {
      //   const data = doc.data() as FirebaseLoan;
      //   loans.push({
      //     id: doc.id,
      //     ...data,
      //     createdAt: data.createdAt,
      //     updatedAt: data.updatedAt
      //   } as Loan);
      //   lastDocument = doc;
      // });

      // return { loans, lastDocument };
    } catch (error: any) {
      throw new Error(`Failed to fetch loans: ${error.message}`);
    }
  }

  async updateLoan(loanId: string, updates: Partial<Loan>): Promise<void> {
    try {
      const loanRef = doc(db, this.loansCollection, loanId);
      await updateDoc(loanRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error: any) {
      throw new Error(`Failed to update loan: ${error.message}`);
    }
  }

  async deleteLoan(loanId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.loansCollection, loanId));
    } catch (error: any) {
      throw new Error(`Failed to delete loan: ${error.message}`);
    }
  }

  // Real-time listeners
  subscribeLoanUpdates(
    callback: (loans: Loan[]) => void,
    userId?: string
  ): () => void {
    // MOCK: Use mock real-time simulator
    import('./mockFirebaseData').then(({ mockRealtimeSimulator, generateMockLoans }) => {
      // Send initial mock data
      const initialLoans = generateMockLoans(10);
      callback(initialLoans);
      
      // Subscribe to mock updates
      mockRealtimeSimulator.subscribe((newLoan) => {
        console.log('[MOCK] Real-time update:', newLoan);
        callback([newLoan, ...initialLoans]);
      });
    });
    
    // Return unsubscribe function
    return () => {
      console.log('[MOCK] Unsubscribing from loan updates');
    };
    
    // PRODUCTION CODE (commented for mock):
    // let q = query(
    //   collection(db, this.loansCollection),
    //   orderBy('createdAt', 'desc')
    // );

    // if (userId) {
    //   q = query(
    //     collection(db, this.loansCollection),
    //     where('userId', '==', userId),
    //     orderBy('createdAt', 'desc')
    //   );
    // }

    // const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    //   const loans: Loan[] = [];
    //   querySnapshot.forEach((doc) => {
    //     const data = doc.data() as FirebaseLoan;
    //     loans.push({
    //       id: doc.id,
    //       ...data
    //     } as Loan);
    //   });
    //   callback(loans);
    // });

    // return unsubscribe;
  }

  // File upload
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Analytics
  async logEvent(eventName: string, parameters?: Record<string, any>): Promise<void> {
    // This would integrate with Firebase Analytics
    console.log('Analytics event:', eventName, parameters);
  }
}

export const firebaseService = FirebaseService.getInstance();