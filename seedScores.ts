import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

// Need to initialize with the project's config
import fs from 'fs';
import path from 'path';

async function seed() {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    console.log("No firebase config found.");
    return;
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const app = initializeApp(config);
  const db = getFirestore(app);

  const studentsSnapshot = await getDocs(collection(db, 'students'));
  const students = studentsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  if (students.length === 0) {
    console.log("No students found to seed.");
    return;
  }

  const session = '2023-2024';
  const term = '1st Term';
  const subjects = ['Mathematics', 'English Language', 'Basic Science', 'Basic Technology', 'Civic Education'];

  let count = 0;

  for (const student of students) {
    // Generate scores for subjects
    for (const subject of subjects) {
      const ca1 = Math.floor(Math.random() * 10);
      const ca2 = Math.floor(Math.random() * 10);
      const ca3 = Math.floor(Math.random() * 10);
      const ca4 = Math.floor(Math.random() * 10);
      const ca = ca1 + ca2 + ca3 + ca4;
      const exam = Math.floor(Math.random() * 60);
      
      const docId = `${session.replace('/', '-')}_${term}_${student.class}_${student.arm}_${subject}_${student.id}`;
      await setDoc(doc(db, 'scores', docId), {
        studentId: student.id,
        studentName: student.name,
        admissionNo: student.admissionNo,
        session,
        term,
        class: student.class,
        arm: student.arm,
        subject,
        ca1,
        ca2,
        ca3,
        ca4,
        ca,
        exam,
        total: ca + exam
      });
      count++;
    }

    // Generate term assessment
    const assessId = `${session.replace('/', '-')}_${term}_${student.class}_${student.arm}_${student.id}`;
    await setDoc(doc(db, 'term_assessments', assessId), {
      studentId: student.id,
      studentName: student.name,
      session,
      term,
      class: student.class,
      arm: student.arm,
      attendance: Math.floor(Math.random() * 20) + 100, // 100 to 120
      schoolOpenDays: 120,
      teacherComment: "A hardworking and brilliant student.",
      principalComment: "Excellent performance. Keep it up."
    });
  }

  console.log(`Seeded ${count} score records and term assessments for ${students.length} students.`);
  process.exit(0);
}

seed().catch(console.error);
