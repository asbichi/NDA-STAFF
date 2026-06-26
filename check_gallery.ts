import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkGallery() {
  try {
    const querySnapshot = await getDocs(collection(db, 'gallery_members'));
    console.log(`Total members found: ${querySnapshot.size}`);
    
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id}: ${JSON.stringify(doc.data())}`);
    });
  } catch (err) {
    console.error(err);
  }
}

checkGallery();
