
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkStudents() {
  try {
    const q = query(collection(db, 'students'), limit(5));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("CRITICAL: Students collection is empty!");
    } else {
      console.log(`Found ${querySnapshot.size} sample students:`);
      querySnapshot.forEach(doc => {
        console.log(JSON.stringify(doc.data()));
      });
    }
  } catch (err) {
    console.error(err);
  }
}

checkStudents();
