
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkStudents() {
  try {
    const querySnapshot = await getDocs(collection(db, 'students'));
    console.log(`Total students found: ${querySnapshot.size}`);
    
    const classCounts: Record<string, number> = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const key = `${data.class} (${data.arm})`;
      classCounts[key] = (classCounts[key] || 0) + 1;
    });
    
    console.log('Class distribution:');
    console.log(JSON.stringify(classCounts, null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkStudents();
