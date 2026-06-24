import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default mock config to prevent crash if file is missing
const defaultConfig = {
  apiKey: "placeholder",
  authDomain: "placeholder",
  projectId: "placeholder",
  storageBucket: "placeholder",
  messagingSenderId: "placeholder",
  appId: "placeholder",
  firestoreDatabaseId: "(default)"
};

let firebaseConfig = defaultConfig;

try {
  // We use a dynamic import to avoid build-time errors if the file is missing
  // In this environment, we can try to import it directly
  // @ts-ignore
  const config = await import('../../firebase-applet-config.json');
  firebaseConfig = config.default;
} catch (e) {
  console.warn('Firebase configuration file not found. Using placeholder config.');
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
