import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  db,
  serverTimestamp
} from './firebase.js';

const STORAGE_KEY = 'fitos.local.profile';

export async function signup(email, password, profile) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;
  const payload = { ...profile, email, uid, createdAt: new Date().toISOString() };
  await setDoc(doc(db, 'users', uid), payload);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return credential.user;
}

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, 'users', credential.user.uid));
  if (snap.exists()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snap.data()));
  }
  return credential.user;
}

export async function saveProfile(uid, profile) {
  const payload = {
    ...profile,
    uid,
    updatedAt: new Date().toISOString(),
    updatedAtServer: serverTimestamp()
  };
  await setDoc(doc(db, 'users', uid), payload, { merge: true });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export async function logout() {
  await signOut(auth);
  localStorage.removeItem(STORAGE_KEY);
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function loadLocalProfile() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
