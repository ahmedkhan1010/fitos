import { bootAuth, signIn, signUp, logOut, saveProfile, saveLog, loadRecent, authState } from './auth.js';
import { foods, searchFoods } from './data/foods.js';
import { exercises, injuryReasons } from './data/exercises.js';
import { getCoachAnswer } from './data/coaching.js';

const el = (sel, root = document) => root.querySelector(sel);
const els = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = {
  section: 'dashboard',
  profile: {
    goal: 'Gain muscle',
    experience: 'Beginner',
    equipment: 'Dumbbells',
    injuries: '',
    days: 4,
    height: '',
    weight: '',
  },
  plan: [],
  meals: [],
  workouts: [],
  messages: [],
};

const appRoot = document.createElement('div');
appRoot.id = 'appRoot';
document.body.appendChild(appRoot);

const shell = document.createElement('section');
shell.className = 'app-shell hidden';
shell.innerHTML = `
  <div class="wrap app-grid">
    <aside class="sidebar">
      <div class="side-card glass">
        <h3 id="userGreeting">Welcome</h3>
        <p class="muted" id="userMeta">Your plan will appear after onboarding.</p>
        <div class="side-nav" id="navButtons"></div>
      </div>
      <div class="side-card glass">
        <h3>Today</h3>
        <p class="muted" id="todaySummary">Login to unlock your custom workout, nutrition, and AI coach.</p>
      </div>
    </aside>

    <div class="workspace" id="workspace"></div>
  </div>
`;
appRoot.appendChild(shell);

function buildLanding() {
  const landing = document.createElement('main');
  landing.id = 'landing';
  landing.innerHTML = `
    <header class="topbar">
      <div class="wrap topbar-inner">
        <a class="brand" href="#home">
          <span class="brand-mark">F</span>
          <span>FitOS</span>
        </a>
        <nav class="nav" aria-label="Primary">
          <a href="#login">Login</a>
          <a href="#testimonials">Testimonials</a>
        </nav>
      </div>
    </header>

    <div class="wrap">
      <section class="hero" id="home">
        <div class="hero-grid">
          <div class="hero-main glass">
            <div class="kicker">Free fitness operating system • simple public homepage • all features unlock after login</div>
            <h1>FitOS.</h1>
            <p class="lede">
              A complete fitness platform for custom training, Indian calorie tracking, AI coaching, and per-user saved progress.
              Sign in once, and the full experience opens around your own routine.
            </p>
            <div class="chip-row">
              <span class="chip">Custom plans</span>
              <span class="chip">Calorie tracking</span>
              <span class="chip">Workout logging</span>
              <span class="chip">AI coach</span>
              <span class="chip">Saved account data</span>
            </div>
          </div>

          <div class="auth-card glass" id="login">
            <h2>Login or create account</h2>
            <p class="muted">The full app stays hidden until the user signs in.</p>
            <div class="auth-wrap">
              <form class="field-grid" id="loginForm">
                <div class="field"><label for="loginEmail">Email</label><input id="loginEmail" type="email" required placeholder="you@example.com"></div>
                <div class="field"><label for="loginPassword">Password</label><input id="loginPassword" type="password" required placeholder="••••••••"></div>
                <div class="auth-actions">
                  <button class="btn btn-primary" type="submit">Login</button>
                  <button class="btn btn-ghost" type="button" id="fillDemoLogin">Demo fill</button>
                </div>
              </form>

              <form class="field-grid" id="signupForm">
                <div class="field"><label for="signupName">Name</label><input id="signupName" type="text" required placeholder="Your name"></div>
                <div class="field"><label for="signupEmail">Email</label><input id="signupEmail" type="email" required placeholder="you@example.com"></div>
                <div class="field"><label for="signupPassword">Password</label><input id="signupPassword" type="password" required placeholder="Create a password"></div>
                <div class="auth-actions">
                  <button class="btn btn-success" type="submit">Create account</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="testimonials">
        <div class="section-card glass">
          <div class="section-head">
            <div>
              <h2>Testimonials</h2>
              <p>Public-facing proof should stay simple and emotional, not technical.</p>
            </div>
          </div>
          <div class="grid-3">
            <article class="testimonial">
              <p class="quote">"Finally a fitness app that feels clear instead of crowded. The login is simple and the private workspace opens right after sign-in."</p>
              <div class="person"><strong>Riya</strong><span>Strength training</span></div>
            </article>
            <article class="testimonial">
              <p class="quote">"The Indian food tracker makes meal logging much easier. I can type what I ate and it finds a close match fast."</p>
              <div class="person"><strong>Arjun</strong><span>Nutrition tracking</span></div>
            </article>
            <article class="testimonial">
              <p class="quote">"The custom plan and progress review idea is exactly what beginners need. It feels personal, not generic."</p>
              <div class="person"><strong>Meera</strong><span>Home workouts</span></div>
            </article>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-card glass">
          <div class="section-head">
            <div>
              <h2>About</h2>
              <p>FitOS was developed by Ahmed Khan. Support: ahmedkhann235235@gmail.com</p>
            </div>
          </div>
          <div class="panel">
            <p class="small" style="margin:0;">
              FitOS is built to feel lightweight on any device, but powerful after login: onboarding, workout planning, set logging,
              nutrition tracking, AI coaching, and progress updates all live inside the same account.
            </p>
          </div>
        </div>
      </section>
    </div>
  `;
  document.body.insertBefore(landing, appRoot);
  return landing;
}

const landing = buildLanding();
const loginForm = el('#loginForm');
const signupForm = el('#signupForm');
const fillDemoLogin = el('#fillDemoLogin');
const workspace = el('#workspace');
const navButtons = el('#navButtons');
const userGreeting = el('#userGreeting');
const userMeta = el('#userMeta');
const todaySummary = el('#todaySummary');

const sections = [
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'plan', label: 'Plan' },
  { id: 'workout', label: 'Workout' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'coach', label: 'AI Coach' },
  { id: 'progress', label: 'Progress' },
  { id: 'settings', label: 'Settings' },
];

function renderNav() {
  navButtons.innerHTML = sections.map((s) => `<button type="button" class="${s.id === state.section ? 'active' : ''}" data-section="${s.id}">${s.label}</button>`).join('');
  els('[data-section]', navButtons).forEach((btn) => {
    btn.addEventListener('click', () => {
      state.section = btn.dataset.section;
      renderApp();
      renderNav();
    });
  });
}

function calcMealTotals(items) {
  return items.reduce((acc, item) => {
    acc.calories += Number(item.calories || 0);
    acc.protein += Number(item.protein || 0);
    acc.carbs += Number(item.carbs || 0);
    acc.fat += Number(item.fat || 0);
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function getPlanText(profile) {
  return `Goal: ${profile.goal} • Experience: ${profile.experience} • Equipment: ${profile.equipment} • Days: ${profile.days}`;
}

function generatePlan(profile) {
  const base = exercises.filter((ex) => {
    if (profile.equipment === 'Bodyweight') return ex.equipment === 'Bodyweight';
    if (profile.equipment === 'Dumbbells') return ex.equipment === 'Bodyweight' || ex.equipment === 'Dumbbells';
    return true;
  });
  const byGoal = profile.goal.includes('Fat')
    ? ['Goblet squat', 'Walking lunge', 'Plank', 'Lat pulldown']
    : ['Push-up', 'Dumbbell bench press', 'Goblet squat', 'One-arm dumbbell row'];
  const selected = byGoal.map((name) => base.find((x) => x.name === name) || exercises.find((x) => x.name === name)).filter(Boolean);
  state.plan = selected.map((ex, index) => ({
    day: index + 1,
    name: ex.name,
    sets: profile.experience === 'Beginner' ? 3 : 4,
    reps: profile.goal.includes('Fat') ? '10-15' : '6-10',
    note: profile.injuries ? `Modified because: ${profile.injuries}` : 'Progressive overload ready',
  }));
}

function renderDashboard() {
  const profile = authState.profile || state.profile;
  const meals = state.meals;
  const totals = calcMealTotals(meals);
  const maxCals = 2200;
  return `
    <div class="workspace-panel">
      <div class="toolbar">
        <div>
          <h2 style="margin:0;">Dashboard</h2>
          <p class="muted" style="margin:6px 0 0;">${getPlanText(profile)}</p>
        </div>
        <div class="tabs">
          <span class="badge green">Ready</span>
          <span class="badge yellow">21-day check</span>
        </div>
      </div>
      <div class="card-grid">
        <div class="metric"><strong>Calories</strong><div class="value">${totals.calories}</div><span>Logged today</span></div>
        <div class="metric"><strong>Protein</strong><div class="value">${totals.protein.toFixed(0)}g</div><span>From meals</span></div>
        <div class="metric"><strong>Plan status</strong><div class="value">Active</div><span>Custom routine ready</span></div>
      </div>
      <div style="margin-top:14px;" class="progress-bar"><div style="width:${Math.min(100, (totals.calories / maxCals) * 100)}%"></div></div>
      <div class="divider"></div>
      <div class="grid-2">
        <div class="mini-card">
          <strong>Today’s summary</strong>
          <span>When the user logs in, the app unlocks the private workspace and keeps data tied to the account.</span>
        </div>
        <div class="mini-card">
          <strong>Next action</strong>
          <span>Complete onboarding first so the workout plan can be generated with the correct split and intensity.</span>
        </div>
      </div>
    </div>`;
}

function renderOnboarding() {
  const p = authState.profile || state.profile;
  return `
  <div class="workspace-panel">
    <div class="section-title"><h3>Onboarding</h3><span class="badge yellow">Build the custom plan first</span></div>
    <div class="grid-2">
      <form class="grid-form" id="onboardingForm">
        <div class="field"><label>Primary goal</label><select name="goal"><option ${p.goal==='Gain muscle'?'selected':''}>Gain muscle</option><option ${p.goal==='Fat loss'?'selected':''}>Fat loss</option><option ${p.goal==='Maintenance'?'selected':''}>Maintenance</option></select></div>
        <div class="field"><label>Training experience</label><select name="experience"><option ${p.experience==='Beginner'?'selected':''}>Beginner</option><option ${p.experience==='Intermediate'?'selected':''}>Intermediate</option><option ${p.experience==='Advanced'?'selected':''}>Advanced</option></select></div>
        <div class="field"><label>Preferred equipment</label><select name="equipment"><option ${p.equipment==='Bodyweight'?'selected':''}>Bodyweight</option><option ${p.equipment==='Dumbbells'?'selected':''}>Dumbbells</option><option ${p.equipment==='Machines'?'selected':''}>Machines</option><option ${p.equipment==='Barbell'?'selected':''}>Barbell</option></select></div>
        <div class="field"><label>Training days per week</label><input name="days" type="number" min="1" max="7" value="${p.days}"></div>
        <div class="field"><label>Height (cm)</label><input name="height" type="text" value="${p.height || ''}"></div>
        <div class="field"><label>Weight (kg)</label><input name="weight" type="text" value="${p.weight || ''}"></div>
        <div class="field"><label>Injuries / limitations</label><textarea name="injuries" placeholder="Knee pain, shoulder pain, no barbells, etc.">${p.injuries || ''}</textarea></div>
        <div class="auth-actions"><button class="btn btn-primary" type="submit">Save profile and generate plan</button></div>
      </form>
      <div class="mini-card">
        <strong>Why this exists</strong>
        <span>The app should ask the user enough questions before making a plan so the workout is actually personal.</span>
        <div class="divider"></div>
        <ul class="compact-list">
          <li>Goal</li>
          <li>Experience</li>
          <li>Equipment</li>
          <li>Injuries</li>
          <li>Training frequency</li>
        </ul>
      </div>
    </div>
  </div>`;
}

function renderPlan() {
  if (!state.plan.length) generatePlan(authState.profile || state.profile);
  return `
  <div class="workspace-panel">
    <div class="section-title"><h3>Today’s plan</h3><span class="badge green">Adaptive</span></div>
    <div class="grid-form">
      ${state.plan.map((item) => `
        <div class="plan-step">
          <strong>Day ${item.day}: ${item.name}</strong>
          <div class="muted">${item.sets} sets • ${item.reps} reps • ${item.note}</div>
        </div>`).join('')}
    </div>
    <div class="divider"></div>
    <p class="small" style="margin:0;">This section only becomes useful after login and onboarding, because the workout should match the user’s own input.</p>
  </div>`;
}

function renderWorkout() {
  const current = state.plan[0] || { name: 'Push-up', sets: 3, reps: '8-12', note: 'Default starter flow' };
  return `
  <div class="workspace-panel">
    <div class="section-title"><h3>Workout mode</h3><span class="badge red">Private after login</span></div>
    <div class="grid-2">
      <div class="mini-card">
        <strong>${current.name}</strong>
        <span>${current.sets} sets • ${current.reps} reps</span>
        <div class="divider"></div>
        <p class="small" style="margin:0;">If the user cannot do the exercise, the app should ask why and swap or scale the movement accordingly.</p>
      </div>
      <div class="grid-form">
        <button class="btn btn-primary" id="logSetBtn" type="button">Log completed set</button>
        <button class="btn btn-secondary" id="cantDoBtn" type="button">I cannot do this exercise</button>
        <button class="btn btn-ghost" id="progressReviewBtn" type="button">21-day progress review</button>
        <div class="empty" id="workoutMessage">No sets logged yet.</div>
      </div>
    </div>
  </div>`;
}

function renderNutrition() {
  const recent = state.meals.slice(-6).reverse();
  return `
  <div class="workspace-panel">
    <div class="section-title"><h3>Nutrition</h3><span class="badge yellow">Indian calorie tracker</span></div>
    <div class="search-row">
      <input class="search-input" id="foodSearch" placeholder="Search food, for example: roti, paneer, rice, idli...">
      <button class="btn btn-primary" id="suggestFoodBtn" type="button">Food suggestions</button>
    </div>
    <div class="divider"></div>
    <div class="grid-2">
      <div>
        <div id="foodResults" class="grid-form"></div>
      </div>
      <div>
        <div class="section-title"><h3>Recent meals</h3></div>
        <div id="mealList" class="grid-form">${recent.length ? recent.map(renderMeal).join('') : '<div class="empty">No meals logged yet.</div>'}</div>
      </div>
    </div>
  </div>`;
}

function renderMeal(meal) {
  return `<div class="meal-item"><strong>${meal.name}</strong><div class="muted">${meal.serving || ''} • ${meal.calories} kcal • P ${meal.protein}g • C ${meal.carbs}g • F ${meal.fat}g</div></div>`;
}

function renderCoach() {
  const last = state.messages.slice(-6).reverse();
  return `
  <div class="workspace-panel">
    <div class="section-title"><h3>AI Coach</h3><span class="badge green">Retrieval layer</span></div>
    <div class="grid-form">
      <textarea id="coachInput" placeholder="Ask anything about training, food, recovery, progress, or injury-related modifications..."></textarea>
      <button class="btn btn-primary" id="askCoachBtn" type="button">Ask coach</button>
      <div id="coachReply" class="mini-card">The coach will answer after the user sends a message.</div>
    </div>
    <div class="divider"></div>
    <div class="grid-form">${last.length ? last.map((msg) => `<div class="chat-item"><strong>You:</strong> ${msg.q}<br><strong>Coach:</strong> ${msg.a}</div>`).join('') : '<div class="empty">No messages yet.</div>'}</div>
  </div>`;
}

function renderProgress() {
  return `
  <div class="workspace-panel">
    <div class="section-title"><h3>Progress</h3><span class="badge red">Review every 21 days</span></div>
    <div class="grid-2">
      <div class="mini-card"><strong>Strength checks</strong><span>Push-ups, squats, pulls, and other key movements should be rechecked every 21 days.</span></div>
      <div class="mini-card"><strong>Custom updates</strong><span>Use the new test results to raise, keep, or lower the plan based on actual performance.</span></div>
    </div>
    <div class="divider"></div>
    <div class="grid-form">
      <div class="settings-item">Progress logic placeholder: compare current performance to the last checkpoint and update targets.</div>
      <div class="settings-item">Later: charts, streaks, body metrics, photos, and milestone summaries.</div>
    </div>
  </div>`;
}

function renderSettings() {
  const user = authState.user || { displayName: 'Member', email: '' };
  return `
  <div class="workspace-panel">
    <div class="section-title"><h3>Settings</h3><span class="badge yellow">Account and support</span></div>
    <div class="grid-2">
      <div class="mini-card"><strong>Signed in as</strong><span>${user.displayName || 'Member'}<br>${user.email || ''}</span></div>
      <div class="mini-card"><strong>Support</strong><span>Developed by Ahmed Khan<br>ahmedkhann235235@gmail.com</span></div>
    </div>
    <div class="divider"></div>
    <button class="btn btn-danger" id="logoutBtn" type="button">Logout</button>
  </div>`;
}

function renderApp() {
  userGreeting.textContent = `Welcome, ${authState.user?.displayName || 'Member'}`;
  userMeta.textContent = authState.profile ? getPlanText(authState.profile) : 'Complete onboarding to generate a custom routine.';
  todaySummary.textContent = authState.profile ? `Goal: ${authState.profile.goal} • ${authState.profile.days} days/week • ${authState.profile.equipment}` : 'Onboarding not completed yet.';

  const view = {
    onboarding: renderOnboarding(),
    dashboard: renderDashboard(),
    plan: renderPlan(),
    workout: renderWorkout(),
    nutrition: renderNutrition(),
    coach: renderCoach(),
    progress: renderProgress(),
    settings: renderSettings(),
  }[state.section];
  workspace.innerHTML = view;
  attachHandlers();
}

function attachHandlers() {
  const onboardingForm = el('#onboardingForm');
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(onboardingForm);
      const nextProfile = {
        goal: form.get('goal'),
        experience: form.get('experience'),
        equipment: form.get('equipment'),
        days: Number(form.get('days')) || 4,
        height: String(form.get('height') || ''),
        weight: String(form.get('weight') || ''),
        injuries: String(form.get('injuries') || ''),
      };
      state.profile = nextProfile;
      await saveProfile(authState.user.uid, nextProfile);
      generatePlan(nextProfile);
      state.section = 'plan';
      renderNav();
      renderApp();
    });
  }

  const foodSearch = el('#foodSearch');
  const foodResults = el('#foodResults');
  const renderFoodResults = (query = '') => {
    const items = searchFoods(query);
    foodResults.innerHTML = items.map((food) => `
      <div class="meal-item">
        <strong>${food.name}</strong>
        <div class="muted">${food.serving} • ${food.calories} kcal • P ${food.protein}g • C ${food.carbs}g • F ${food.fat}g</div>
        <div class="auth-actions" style="margin-top:10px;">
          <button class="btn btn-secondary" type="button" data-food='${JSON.stringify(food).replace(/'/g, "&#39;")}' data-action="logFood">Log food</button>
        </div>
      </div>
    `).join('');
    els('[data-action="logFood"]', foodResults).forEach((btn) => {
      btn.addEventListener('click', async () => {
        const food = JSON.parse(btn.dataset.food);
        const meal = { uid: authState.user.uid, ...food };
        state.meals.push(meal);
        await saveLog('nutritionLogs', meal);
        renderApp();
      });
    });
  };
  if (foodResults) {
    renderFoodResults('');
    foodSearch?.addEventListener('input', (e) => renderFoodResults(e.target.value));
    el('#suggestFoodBtn')?.addEventListener('click', () => {
      renderFoodResults('protein');
    });
  }

  el('#logSetBtn')?.addEventListener('click', async () => {
    state.workouts.push({ name: state.plan[0]?.name || 'Push-up', date: Date.now() });
    await saveLog('workoutSessions', { uid: authState.user.uid, exercise: state.plan[0]?.name || 'Push-up' });
    const msg = el('#workoutMessage');
    if (msg) msg.textContent = 'Set logged. The plan can later progress automatically from the completed session data.';
  });

  el('#cantDoBtn')?.addEventListener('click', () => {
    const reason = window.prompt(`Why can't the user do this exercise?\n\n${injuryReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}`);
    const msg = el('#workoutMessage');
    if (msg) msg.textContent = reason ? `Recorded reason: ${reason}. Next version should swap the exercise and scale the load.` : 'Reason entry cancelled.';
  });

  el('#progressReviewBtn')?.addEventListener('click', () => {
    const msg = el('#workoutMessage');
    if (msg) msg.textContent = '21-day review triggered. The app should ask how many push-ups, squats, and key lifts the user can now perform.';
  });

  el('#askCoachBtn')?.addEventListener('click', () => {
    const input = el('#coachInput');
    const reply = el('#coachReply');
    const q = input?.value.trim();
    if (!q) return;
    const a = getCoachAnswer(q);
    state.messages.push({ q, a });
    if (reply) reply.textContent = a;
    input.value = '';
    renderApp();
  });

  el('#logoutBtn')?.addEventListener('click', async () => {
    await logOut();
    window.location.reload();
  });
}

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await signIn({
      email: el('#loginEmail').value,
      password: el('#loginPassword').value,
    });
  } catch (err) {
    alert(err?.message || 'Login failed.');
  }
});

signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await signUp({
      name: el('#signupName').value,
      email: el('#signupEmail').value,
      password: el('#signupPassword').value,
    });
  } catch (err) {
    alert(err?.message || 'Signup failed.');
  }
});

fillDemoLogin?.addEventListener('click', () => {
  el('#loginEmail').value = 'demo@fitos.app';
  el('#loginPassword').value = 'password123';
  el('#signupName').value = 'Demo User';
  el('#signupEmail').value = 'demo@fitos.app';
  el('#signupPassword').value = 'password123';
});

bootAuth((current) => {
  const signedIn = Boolean(current.user);
  landing.classList.toggle('hidden', signedIn);
  shell.classList.toggle('hidden', !signedIn);
  if (signedIn) {
    renderNav();
    renderApp();
  }
});
