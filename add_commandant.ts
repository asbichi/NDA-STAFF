import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addCommandant() {
  try {
    const colRef = collection(db, 'gallery_members');
    const item = {
      name: 'Major General Oluyemi Olatoye',
      title: 'Commandant',
      role: 'management' as const,
      imageUrl: 'https://i.ibb.co/XrG3bZ0x/69efe8aa-ef2e-40e5-829b-308070da4ff9.jpg',
      description: 'Providing strategic leadership and ensuring high standards of discipline and educational excellence at the NDA Staff Secondary School.',
      order: 1
    };
    await addDoc(colRef, { ...item, createdAt: serverTimestamp() });
    console.log("Commandant added!");
  } catch (err) {
    console.error(err);
  }
}

addCommandant();
