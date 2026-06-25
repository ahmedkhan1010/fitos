const USERS_KEY = 'fitos_users_v1';
const SESSION_KEY = 'fitos_session_v1';
const LOGS_KEY = 'fitos_logs_v1';

export const authState = {
  user: null,
  profile: null,
  ready: false,
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function usersDb() {
  return readJson(USERS_KEY, {});
}

function sessionDb() {
  return readJson(SESSION_KEY, null);
}

function logsDb() {
  return readJson(LOGS_KEY, { workouts: [], meals: [], messages: [] });
}

function saveSession(user) {
  writeJson(SESSION_KEY, user);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function bootAuth(onChange) {
  const session = sessionDb();
  if (session?.user) {
    authState.user = session.user;
    authState.profile = session.profile || null;
  }
  authState.ready = true;
  onChange?.(authState);
}

export async function signUp({ name, email, password }) {
  const users = usersDb();
  const normalized = normalizeEmail(email);
  if (!normalized || !password) throw new Error('Email and password are required.');
  if (users[normalized]) throw new Error('Account already exists. Please log in.');

  const user = {
    uid: crypto.randomUUID(),
    email: normalized,
    displayName: name?.trim() || normalized.split('@')[0],
    password,
  };
  users[normalized] = user;
  writeJson(USERS_KEY, users);

  const profile = {
    uid: user.uid,
    name: user.displayName,
    email: normalized,
    createdAt: Date.now(),
    goal: 'Gain muscle',
    experience: 'Beginner',
    equipment: 'Dumbbells',
    days: 4,
    height: '',
    weight: '',
    injuries: '',
  };

  authState.user = { uid: user.uid, email: normalized, displayName: user.displayName };
  authState.profile = profile;
  saveSession({ user: authState.user, profile });
  return authState.user;
}

export async function signIn({ email, password }) {
  const users = usersDb();
  const normalized = normalizeEmail(email);
  const user = users[normalized];
  if (!user || user.password !== password) throw new Error('Invalid email or password.');

  const profile = getProfile(normalized) || {
    uid: user.uid,
    name: user.displayName,
    email: normalized,
    createdAt: Date.now(),
    goal: 'Gain muscle',
    experience: 'Beginner',
    equipment: 'Dumbbells',
    days: 4,
    height: '',
    weight: '',
    injuries: '',
  };

  authState.user = { uid: user.uid, email: normalized, displayName: user.displayName };
  authState.profile = profile;
  saveSession({ user: authState.user, profile });
  return authState.user;
}

export async function logOut() {
  authState.user = null;
  authState.profile = null;
  clearSession();
}

export function getProfile(email) {
  const session = sessionDb();
  if (session?.profile) return session.profile;
  const users = usersDb();
  const normalized = normalizeEmail(email);
  const user = users[normalized];
  return user ? {
    uid: user.uid,
    name: user.displayName,
    email: normalized,
    createdAt: Date.now(),
    goal: 'Gain muscle',
    experience: 'Beginner',
    equipment: 'Dumbbells',
    days: 4,
    height: '',
    weight: '',
    injuries: '',
  } : null;
}

export async function saveProfile(uid, patch) {
  const session = sessionDb();
  const profile = { ...(session?.profile || authState.profile || {}), ...patch, uid, updatedAt: Date.now() };
  authState.profile = profile;
  saveSession({ user: authState.user, profile });
}

export async function saveLog(type, data) {
  const db = logsDb();
  if (type === 'workouts') db.workouts.unshift({ ...data, createdAt: Date.now() });
  if (type === 'meals') db.meals.unshift({ ...data, createdAt: Date.now() });
  if (type === 'messages') db.messages.unshift({ ...data, createdAt: Date.now() });
  writeJson(LOGS_KEY, db);
}

export function getRecentLogs(type, max = 12) {
  const db = logsDb();
  return (db[type] || []).slice(0, max);
}
