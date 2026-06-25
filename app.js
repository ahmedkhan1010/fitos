import { loadLocalProfile, observeAuth, signup, login, logout, saveProfile } from './auth.js';
import foods from './data/foods.js';
import exercises from './data/exercises.js';
import coaching from './data/coaching.js';

const state = {
  theme: localStorage.getItem('fitos.theme') || 'dark',
  profile: loadLocalProfile(),
  foodQuery: '',
};

const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function applyTheme() {
  if (state.theme === 'light') {
    document.body.dataset.theme = 'light';
  } else {
    document.body.dataset.theme = 'dark';
  }
}

themeToggle?.addEventListener('click', () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('fitos.theme', state.theme);
  applyTheme();
});

applyTheme();

function renderBootstrapData() {
  const sampleFoodCount = foods.length;
  const sampleExerciseCount = exercises.length;
  console.log(`FitOS ready with ${sampleFoodCount} foods and ${sampleExerciseCount} exercises.`);
}

renderBootstrapData();

observeAuth((user) => {
  if (user) {
    console.log('Signed in:', user.email);
  } else {
    console.log('Signed out');
  }
});

window.FitOS = {
  foods,
  exercises,
  coaching,
  signup,
  login,
  logout,
  saveProfile
};
