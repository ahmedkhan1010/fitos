import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "./firebase.js";

const LOCAL_KEY = "fitos_demo_user";

export const authState = {
  user: null,
  profile: null,
  ready: false,
};

function fallbackSave(user) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(user));
}

function fallbackLoad() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "null");
  } catch {
    return null;
  }
}

export async function bootAuth(onChange) {
  const saved = fallbackLoad();
  if (saved) {
    authState.user = saved.user;
    authState.profile = saved.profile || null;
    authState.ready = true;
    onChange?.(authState);
  }

  try {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        authState.user = saved?.user || null;
        authState.profile = saved?.profile || null;
        authState.ready = true;
        onChange?.(authState);
        return;
      }

      authState.user = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Member",
      };
      authState.profile = await loadProfile(firebaseUser.uid);
      authState.ready = true;
      fallbackSave({ user: authState.user, profile: authState.profile });
      onChange?.(authState);
    });
  } catch {
    authState.ready = true;
    onChange?.(authState);
  }
}

export async function signUp({ name, email, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }
  const profile = {
    uid: cred.user.uid,
    name: name || cred.user.displayName || email.split("@")[0],
    email,
    createdAt: Date.now(),
  };
  await setDoc(doc(db, "profiles", cred.user.uid), profile, { merge: true });
  authState.user = { uid: cred.user.uid, email, displayName: profile.name };
  authState.profile = profile;
  fallbackSave({ user: authState.user, profile });
  return cred.user;
}

export async function signIn({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await loadProfile(cred.user.uid);
  authState.user = {
    uid: cred.user.uid,
    email: cred.user.email,
    displayName: cred.user.displayName || profile?.name || email.split("@")[0],
  };
  authState.profile = profile;
  fallbackSave({ user: authState.user, profile });
  return cred.user;
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch {}
  authState.user = null;
  authState.profile = null;
  localStorage.removeItem(LOCAL_KEY);
}

export async function loadProfile(uid) {
  try {
    const snapshot = await getDoc(doc(db, "profiles", uid));
    return snapshot.exists() ? snapshot.data() : null;
  } catch {
    const saved = fallbackLoad();
    return saved?.profile || null;
  }
}

export async function saveProfile(uid, patch) {
  const payload = { ...patch, updatedAt: Date.now() };
  try {
    await setDoc(doc(db, "profiles", uid), payload, { merge: true });
  } catch {
    const saved = fallbackLoad() || { user: authState.user, profile: {} };
    saved.profile = { ...(saved.profile || {}), ...payload };
    fallbackSave(saved);
  }
}

export async function saveLog(collectionName, data) {
  const payload = { ...data, createdAt: serverTimestamp() };
  try {
    await addDoc(collection(db, collectionName), payload);
  } catch {
    const key = `fitos_logs_${collectionName}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.unshift({ ...data, createdAt: Date.now() });
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 200)));
  }
}

export async function loadRecent(collectionName, uid, max = 10) {
  try {
    const q = query(collection(db, collectionName), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    const key = `fitos_logs_${collectionName}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    return existing.slice(0, max);
  }
}
