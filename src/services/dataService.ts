
import { db } from '../firebase';
import { collection, doc, setDoc, writeBatch, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

const SUBJECT_CATEGORIES = {
  jss: ['Mathematics', 'English Language', 'Basic Science', 'Basic Technology', 'Social Studies', 'Civic Education', 'Agricultural Science', 'Business Studies', 'Computer Studies', 'PHE', 'CRS', 'IRS', 'French', 'Home Economics', 'Fine Arts'],
  sss_science: ['Mathematics', 'English Language', 'Civic Education', 'Economics', 'Biology', 'Physics', 'Chemistry', 'Further Mathematics', 'Agricultural Science', 'Computer Science', 'Geography'],
  sss_art: ['Mathematics', 'English Language', 'Civic Education', 'Economics', 'Biology', 'Agricultural Science', 'Literature in English', 'Government', 'History', 'CRS', 'IRS', 'Fine Arts', 'French'],
  sss_commerce: ['Mathematics', 'English Language', 'Civic Education', 'Economics', 'Biology', 'Agricultural Science', 'Commerce', 'Financial Accounting', 'Office Practice', 'Government']
};

const getAvailableSubjects = (className: string) => {
  if (!className) return [];
  if (className.startsWith('jss')) return SUBJECT_CATEGORIES.jss;
  if (className.includes('science')) return SUBJECT_CATEGORIES.sss_science;
  if (className.includes('art')) return SUBJECT_CATEGORIES.sss_art;
  if (className.includes('commerce')) return SUBJECT_CATEGORIES.sss_commerce;
  return [];
};

export const seedDatabase = async (onProgress: (msg: string) => void) => {
  onProgress("Starting database synchronization...");
  
  const classes = ['jss1', 'jss2', 'jss3', 'sss1_science', 'sss1_art', 'sss1_commerce', 'sss2_science', 'sss2_art', 'sss2_commerce', 'sss3_science', 'sss3_art', 'sss3_commerce'];
  const arms = ['A', 'B', 'C', 'D', 'Science 1', 'Art 1'];
  const session = "2024/2025";
  const term = "1st";

  const studentCountPerCategory = 10; 

  for (const studentClass of classes) {
    onProgress(`Syncing ${studentClass.toUpperCase()}...`);
    const subjects = getAvailableSubjects(studentClass);
    
    for (const arm of arms) {
      if (studentClass.startsWith('jss') && (arm === 'Science 1' || arm === 'Art 1')) continue;
      if (studentClass.includes('science') && (arm === 'Art 1')) continue;
      if (studentClass.includes('art') && (arm === 'Science 1')) continue;
      if (studentClass.includes('commerce') && (arm === 'Science 1' || arm === 'Art 1')) continue;

      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('class', '==', studentClass), where('arm', '==', arm));
      const existingSnap = await getDocs(q);
      
      if (existingSnap.size >= studentCountPerCategory) {
        onProgress(`Skipping ${studentClass.toUpperCase()} ${arm} (already has ${existingSnap.size} students)...`);
        continue;
      }

      const batch = writeBatch(db);
      
      for (let i = 1; i <= studentCountPerCategory; i++) {
        const studentId = `seeded_${studentClass}_${arm.replace(' ', '_')}_${i}`;
        const name = `${studentClass.toUpperCase().replace('_', ' ')} Student ${i} (${arm})`;
        const admissionNo = `NDA/${studentClass.toUpperCase().replace('_', '/')}/${arm}/${100 + i}`;
        
        // Add Student
        const studentRef = doc(db, 'students', studentId);
        batch.set(studentRef, {
          name,
          studentName: name,
          admissionNo,
          class: studentClass,
          arm: arm,
          gender: i % 2 === 0 ? 'Female' : 'Male',
          createdAt: serverTimestamp()
        });

        // Add Score for each subject
        subjects.forEach(subject => {
          const ca = Math.floor(Math.random() * 20) + 20; // 20-40
          const exam = Math.floor(Math.random() * 30) + 30; // 30-60
          const total = ca + exam;
          const scoreId = `${session.replace('/', '-')}_${term}_${studentClass}_${arm}_${subject.toLowerCase()}_${studentId}`;
          const scoreRef = doc(db, 'scores', scoreId);
          
          batch.set(scoreRef, {
            studentId,
            studentName: name,
            admissionNo,
            session,
            term,
            class: studentClass,
            arm,
            subject: subject.toLowerCase(),
            ca,
            exam,
            total,
            grade: total >= 75 ? 'A' : total >= 65 ? 'B' : total >= 50 ? 'C' : total >= 40 ? 'D' : 'F',
            updatedAt: serverTimestamp()
          });
        });
      }
      try {
        await batch.commit();
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay to prevent rate limits
      } catch (e: any) {
        console.error(`Failed at ${studentClass} ${arm}:`, e);
        throw new Error(`Failed to sync ${studentClass} ${arm}: ${e.message}`);
      }
    }
  }
  
  onProgress("Database successfully synchronized with 2024/2025 records.");
};
