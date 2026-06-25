import { bootAuth, signUp, signIn, logOut, saveProfile, saveLog, authState, getRecentLogs } from './auth.js';
import { foods, searchFoods } from './data/foods.js';
import { exercises, injuryReasons } from './data/exercises.js';
import { getCoachAnswer } from './data/coaching.js';

const app = document.querySelector('#app');

const state = {
  section: 'dashboard',
  plan: [],
  foodQuery: '',
};

function calcMealTotals(items) {
  return items.reduce((acc, item) => {
    acc.calories += Number(item.calories || 0);
    acc.protein += Number(item.protein || 0);
    acc.carbs += Number(item.carbs || 0);
    acc.fat += Number(item.fat || 0);
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function getProfile() {
  return authState.profile || {
    goal: 'Gain muscle',
    experience: 'Beginner',
    equipment: 'Dumbbells',
    days: 4,
    height: '',
    weight: '',
    injuries: ''
  };
}

function generatePlan(profile) {
  const pool = exercises.filter((ex) => {
    if (profile.equipment === 'Bodyweight') return ex.equipment === 'Bodyweight';
    if (profile.equipment === 'Dumbbells') return ex.equipment === 'Bodyweight' || ex.equipment === 'Dumbbells';
    return true;
  });

  const template = profile.goal === 'Fat loss'
    ? ['Walking lunge', 'Goblet squat', 'Plank', 'Lat pulldown']
    : ['Push-up', 'Dumbbell bench press', 'Goblet squat', 'One-arm dumbbell row'];

  state.plan = template.map((name, index) => {
    const ex = pool.find((x) => x.name === name) || exercises.find((x) => x.name === name) || pool[0];
    return {
      day: index + 1,
      name: ex.name,
      sets: profile.experience === 'Beginner' ? 3 : 4,
      reps: profile.goal === 'Fat loss' ? '10-15' : '6-10',
      note: profile.injuries ? `Adjusted for: ${profile.injuries}` : 'Progressive overload ready',
    };
  });
}

function renderLanding() {
  return `
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
            <div class="kicker">Free fitness operating system • all features unlock after login</div>
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
                <div class="field">
                  <label for="loginEmail">Email</label>
                  <input id="loginEmail" type="email" required placeholder="you@example.com">
                </div>
                <div class="field">
                  <label for="loginPassword">Password</label>
                  <input id="loginPassword" type="password" required placeholder="••••••••">
                </div>
                <div class="auth-actions">
                  <button class="btn btn-primary" type="submit">Login</button>
                  <button class="btn btn-ghost" type="button" id="fillDemoLogin">Demo fill</button>
                </div>
              </form>

              <form class="field-grid" id="signupForm">
                <div class="field">
                  <label for="signupName">Name</label>
                  <input id="signupName" type="text" required placeholder="Your name">
                </div>
                <div class="field">
                  <label for="signupEmail">Email</label>
                  <input id="signupEmail" type="email" required placeholder="you@example.com">
                </div>
                <div class="field">
                  <label for="signupPassword">Password</label>
                  <input id="signupPassword" type="password" required placeholder="Create a password">
                </div>
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
              <p>"Finally a fitness app that feels clear instead of crowded. The login is simple and the private workspace opens right after sign-in."</p>
              <div class="person"><strong>Riya</strong><span>Strength training</span></div>
            </article>
            <article class="testimonial">
              <p>"The Indian food tracker makes meal logging much easier. I can type what I ate and it finds a close match fast."</p>
              <div class="person"><strong>Arjun</strong><span>Nutrition tracking</span></div>
            </article>
            <article class="testimonial">
              <p>"The custom plan and progress review idea is exactly what beginners need. It feels personal, not generic."</p>
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
}

function renderSidebar(profile) {
  return `
    <aside class="sidebar">
      <div class="side-card glass">
        <h3>${authState.user?.displayName || 'Member'}</h3>
        <p class="muted">${profile.goal} • ${profile.days} days/week • ${profile.equipment}</p>
        <div class="side-nav">
          ${[
            ['onboarding', 'Onboarding'],
            ['dashboard', 'Dashboard'],
            ['plan', 'Today’s plan'],
            ['workout', 'Workout'],
            ['nutrition', 'Nutrition'],
            ['coach', 'AI Coach'],
            ['progress', 'Progress'],
            ['settings', 'Settings'],
          ].map(([id, label]) => `<button type="button" class="${state.section===id ? 'active' : ''}" data-section="${id}">${label}</button>`).join('')}
        </div>
      </div>
      <div class="side-card glass">
        <h3>Today</h3>
        <p class="muted">${profile.injuries ? `Modified for: ${profile.injuries}` : 'Your custom plan is ready after onboarding.'}</p>
      </div>
    </aside>
  `;
}

function renderDashboard(profile) {
  const meals = getRecentLogs('meals', 100);
  const totals = calcMealTotals(meals);
  return `
    <div class="workspace-panel">
      <div class="toolbar">
        <div>
          <h2 style="margin:0;">Dashboard</h2>
          <p class="muted" style="margin:6px 0 0;">Goal: ${profile.goal} • Experience: ${profile.experience} • ${profile.equipment}</p>
        </div>
        <div class="tabs">
          <span class="badge green">Ready</span>
          <span class="badge yellow">21-day check</span>
        </div>
      </div>
      <div class="card-grid">
        <div class="metric"><strong>Calories logged</strong><div class="value">${totals.calories}</div><span>Today</span></div>
        <div class="metric"><strong>Protein</strong><div class="value">${totals.protein.toFixed(0)}g</div><span>Today</span></div>
        <div class="metric"><strong>Plan</strong><div class="value">${state.plan.length || 4}</div><span>Exercises</span></div>
      </div>
      <div class="divider"></div>
      <div class="grid-2">
        <div class="mini-card"><strong>Unlocked after login</strong><p class="small">All private tools live only inside the authenticated workspace, not on the public homepage.</p></div>
        <div class="mini-card"><strong>Next action</strong><p class="small">Complete onboarding first so the workout plan can match the user’s real goal and equipment.</p></div>
      </div>
    </div>
  `;
}

function renderOnboarding(profile) {
  return `
    <div class="workspace-panel">
      <div class="toolbar">
        <div>
          <h2 style="margin:0;">Onboarding</h2>
          <p class="muted" style="margin:6px 0 0;">Ask enough questions to make the routine personal.</p>
        </div>
        <span class="badge yellow">Private setup</span>
      </div>
      <form id="onboardingForm" class="grid-2">
        <div class="field">
          <label>Primary goal</label>
          <select name="goal">
            ${['Gain muscle','Fat loss','Maintenance'].map(v => `<option ${profile.goal===v?'selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Training experience</label>
          <select name="experience">
            ${['Beginner','Intermediate','Advanced'].map(v => `<option ${profile.experience===v?'selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Preferred equipment</label>
          <select name="equipment">
            ${['Bodyweight','Dumbbells','Machines','Barbell'].map(v => `<option ${profile.equipment===v?'selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Training days per week</label>
          <input name="days" type="number" min="1" max="7" value="${profile.days}">
        </div>
        <div class="field">
          <label>Height (cm)</label>
          <input name="height" type="text" value="${profile.height || ''}">
        </div>
        <div class="field">
          <label>Weight (kg)</label>
          <input name="weight" type="text" value="${profile.weight || ''}">
        </div>
        <div class="field" style="grid-column:1 / -1;">
          <label>Injuries / limitations</label>
          <textarea name="injuries" placeholder="Knee pain, shoulder pain, no barbells, etc.">${profile.injuries || ''}</textarea>
        </div>
        <div class="auth-actions" style="grid-column:1 / -1;">
          <button class="btn btn-primary" type="submit">Save profile and generate plan</button>
        </div>
      </form>
    </div>
  `;
}

function renderPlan(profile) {
  if (!state.plan.length) generatePlan(profile);
  return `
    <div class="workspace-panel">
      <div class="toolbar">
        <div>
          <h2 style="margin:0;">Today’s plan</h2>
          <p class="muted" style="margin:6px 0 0;">Adaptive plan generated from onboarding.</p>
        </div>
        <span class="badge green">Custom</span>
      </div>
      <div class="grid-2">
        ${state.plan.map((item) => `
          <div class="plan-step">
            <strong>Day ${item.day}: ${item.name}</strong>
            <div class="muted">${item.sets} sets • ${item.reps} reps • ${item.note}</div>
          </div>
        `).join('')}
      </div>
      <div class="divider"></div>
      <p class="small" style="margin:0;">Workout mode is only visible after login, and it should run from the user’s own plan instead of a generic public session.</p>
    </div>
  `;
}

function renderWorkout(profile) {
  const current = state.plan[0] || { name: 'Push-up', sets: 3, reps: '8-12', note: 'Default starter flow' };
  return `
    <div class="workspace-panel">
      <div class="toolbar">
        <div>
          <h2 style="margin:0;">Workout</h2>
          <p class="muted" style="margin:6px 0 0;">Private training mode tied to the logged-in user.</p>
        </div>
        <span class="badge red">Adaptive</span>
      </div>
      <div class="grid-2">
        <div class="mini-card">
          <strong>${current.name}</strong>
          <p class="small">${current.sets} sets • ${current.reps} reps</p>
          <p class="small">${current.note}</p>
        </div>
        <div class="grid-form">
          <button class="btn btn-primary" type="button" id="logSetBtn">Log completed set</button>
          <button class="btn btn-secondary" type="button" id="cantDoBtn">I cannot do this exercise</button>
          <button class="btn btn-ghost" type="button" id="progressReviewBtn">21-day progress review</button>
          <div class="empty" id="workoutMessage">No sets logged yet.</div>
        </div>
      </div>
    </div>
  `;
}

function renderNutrition() {
  const meals = getRecentLogs('meals', 12);
  return `
    <div class="workspace-panel">
      <div class="toolbar">
        <div>
          <h2 style="margin:0;">Nutrition</h2>
          <p class="muted" style="margin:6px 0 0;">Dedicated Indian calorie tracker.</p>
        </div>
        <span class="badge yellow">Food database</span>
      </div>
      <div class="search-row">
        <input class="search-input" id="foodSearch" placeholder="Search food: roti, paneer, rice, idli...">
        <button class="btn btn-primary" type="button" id="suggestFoodBtn">Food suggestions</button>
      </div>
      <div class="divider"></div>
      <div class="grid-2">
        <div>
          <div id="foodResults" class="field-grid"></div>
        </div>
        <div>
          <div class="toolbar" style="margin:0 0 10px 0;"><h3 style="margin:0;">Recent meals</h3></div>
          <div id="mealList" class="field-grid">${meals.length ? meals.map(renderMeal).join('') : '<div class="empty">No meals logged yet.</div>'}</div>
        </div>
      </div>
    </div>
  `;
}

function renderMeal(meal) {
  return `<div class="meal-item"><strong>${meal.name}</strong><div class="muted">${meal.serving || ''} • ${meal.calories} kcal • P ${meal.protein}g • C ${meal.carbs}g • F ${meal.fat}g</div></div>`;
}

function renderCoach() {
  const messages = getRecentLogs('messages', 8);
  return `
    <div class="workspace-panel">
      <div class="toolbar">
        <div>
          <h2 style="margin:0;">AI Coach</h2>
          <p class="muted" style="margin:6px 0 0;">Intent detection + knowledge search style answers.</p>
        </div>
        <span class="badge green">Retrieval</span>
      </div>
      <div class="grid-form" style="display:grid;gap:12px;">
        <textarea id="coachInput" placeholder="Ask anything about training, food, recovery, progress, or injury-related modifications..."></textarea>
        <button class="btn btn-primary" type="button" id="askCoachBtn">Ask coach</button>
        <div id="coachReply" class="mini-card">The coach will answer after the user sends a message.</div>
      </div>
      <div class="divider"></div>
      <div class="grid-form" style="display:grid;gap:12px;">
        ${messages.length ? messages.map((msg) => `<div class="chat-item"><strong>You:</strong> ${msg.q}<br><strong>Coach:</strong> ${msg.a}</div>`).join('') : '<div class="empty">No messages yet.</div>'}
      </div>
    </div>
  `;
}

function renderProgress() {
  return `
    <div class="workspace-panel">
      <div class="toolbar">
        <div>
          <h2 style="margin:0;">Progress</h2>
          <p class="muted" style="margin:6px 0 0;">Review every 21 days and update the plan over time.</p>
        </div>
        <span class="badge red">Review cycle</span>
      </div>
      <div class="grid-2">
        <div class="mini-card"><strong>Strength checks</strong><p class="small">Push-ups, squats, pulls, and other key movements should be rechecked every 21 days.</p></div>
        <div class="mini-card"><strong>Custom updates</strong><p class="small">Use the new test results to raise, keep, or lower the plan based on actual performance.</p></div>
      </div>
      <div class="divider"></div>
      <div class="grid-form" style="display:grid;gap:12px;">
        <div class="settings-item">Progress logic placeholder: compare current performance to the last checkpoint and update targets.</div>
        <div class="settings-item">Later: charts, streaks, body metrics, photos, and milestone summaries.</div>
      </div>
    </div>
  `;
}

function renderSettings() {
  const user = authState.user || { displayName: 'Member', email: '' };
  return `
    <div class="workspace-panel">
      <div class="toolbar">
        <div>
          <h2 style="margin:0;">Settings</h2>
          <p class="muted" style="margin:6px 0 0;">Account and support.</p>
        </div>
        <span class="badge yellow">Private</span>
      </div>
      <div class="grid-2">
        <div class="mini-card"><strong>Signed in as</strong><p class="small">${user.displayName || 'Member'}<br>${user.email || ''}</p></div>
        <div class="mini-card"><strong>Support</strong><p class="small">Developed by Ahmed Khan<br>ahmedkhann235235@gmail.com</p></div>
      </div>
      <div class="divider"></div>
      <button class="btn btn-danger" id="logoutBtn" type="button">Logout</button>
    </div>
  `;
}

function renderApp() {
  const profile = getProfile();
  const meals = getRecentLogs('meals', 100);
  const totals = calcMealTotals(meals);
  if (!state.plan.length) generatePlan(profile);

  app.innerHTML = `
    <header class="topbar">
      <div class="wrap topbar-inner">
        <a class="brand" href="#dashboard">
          <span class="brand-mark">F</span>
          <span>FitOS</span>
        </a>
        <nav class="nav" aria-label="Primary">
          <a href="#dashboard" data-section-link="dashboard">Dashboard</a>
          <a href="#nutrition" data-section-link="nutrition">Nutrition</a>
          <a href="#coach" data-section-link="coach">AI Coach</a>
          <a href="#settings" data-section-link="settings">Settings</a>
        </nav>
      </div>
    </header>

    <section class="app-shell">
      <div class="wrap app-grid">
        ${renderSidebar(profile)}
        <div class="workspace">
          ${state.section === 'onboarding' ? renderOnboarding(profile) : ''}
          ${state.section === 'dashboard' ? renderDashboard(profile) : ''}
          ${state.section === 'plan' ? renderPlan(profile) : ''}
          ${state.section === 'workout' ? renderWorkout(profile) : ''}
          ${state.section === 'nutrition' ? renderNutrition() : ''}
          ${state.section === 'coach' ? renderCoach() : ''}
          ${state.section === 'progress' ? renderProgress() : ''}
          ${state.section === 'settings' ? renderSettings() : ''}
        </div>
      </div>
    </section>
  `;

  attachHandlers(profile);
}

function attachHandlers(profile) {
  document.querySelectorAll('[data-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.section = btn.dataset.section;
      renderApp();
    });
  });

  const onboardingForm = document.querySelector('#onboardingForm');
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(onboardingForm);
      const nextProfile = {
        ...profile,
        goal: String(form.get('goal')),
        experience: String(form.get('experience')),
        equipment: String(form.get('equipment')),
        days: Number(form.get('days')) || 4,
        height: String(form.get('height') || ''),
        weight: String(form.get('weight') || ''),
        injuries: String(form.get('injuries') || ''),
      };
      await saveProfile(authState.user.uid, nextProfile);
      state.plan = [];
      state.section = 'plan';
      renderApp();
    });
  }

  const foodSearch = document.querySelector('#foodSearch');
  const foodResults = document.querySelector('#foodResults');
  const renderFoodResults = (query = '') => {
    if (!foodResults) return;
    const items = searchFoods(query);
    foodResults.innerHTML = items.map((food) => `
      <div class="meal-item">
        <strong>${food.name}</strong>
        <div class="muted">${food.serving} • ${food.calories} kcal • P ${food.protein}g • C ${food.carbs}g • F ${food.fat}g</div>
        <div class="auth-actions" style="margin-top:10px;">
          <button class="btn btn-secondary" type="button" data-food="${encodeURIComponent(JSON.stringify(food))}" data-action="logFood">Log food</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('[data-action="logFood"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const food = JSON.parse(decodeURIComponent(btn.dataset.food));
        const meal = { uid: authState.user.uid, ...food };
        await saveLog('meals', meal);
        renderApp();
      });
    });
  };

  if (foodResults) {
    renderFoodResults('');
    foodSearch?.addEventListener('input', (e) => renderFoodResults(e.target.value));
    document.querySelector('#suggestFoodBtn')?.addEventListener('click', () => renderFoodResults('protein'));
  }

  document.querySelector('#logSetBtn')?.addEventListener('click', async () => {
    await saveLog('workouts', { uid: authState.user.uid, exercise: state.plan[0]?.name || 'Push-up' });
    const msg = document.querySelector('#workoutMessage');
    if (msg) msg.textContent = 'Set logged. The plan can later progress automatically from the completed session data.';
  });

  document.querySelector('#cantDoBtn')?.addEventListener('click', () => {
    const reason = window.prompt(`Why can't the user do this exercise?\n\n${injuryReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}`);
    const msg = document.querySelector('#workoutMessage');
    if (msg) msg.textContent = reason ? `Recorded reason: ${reason}. Next version should swap the exercise and scale the load.` : 'Reason entry cancelled.';
  });

  document.querySelector('#progressReviewBtn')?.addEventListener('click', () => {
    const msg = document.querySelector('#workoutMessage');
    if (msg) msg.textContent = '21-day review triggered. The app should ask how many push-ups, squats, and key lifts the user can now perform.';
  });

  document.querySelector('#askCoachBtn')?.addEventListener('click', async () => {
    const input = document.querySelector('#coachInput');
    const reply = document.querySelector('#coachReply');
    const q = input?.value.trim();
    if (!q) return;
    const a = getCoachAnswer(q);
    await saveLog('messages', { uid: authState.user.uid, q, a });
    if (reply) reply.textContent = a;
    input.value = '';
    renderApp();
  });

  document.querySelector('#logoutBtn')?.addEventListener('click', async () => {
    await logOut();
    state.section = 'dashboard';
    render();
  });
}

function render() {
  if (!authState.user) {
    app.innerHTML = renderLanding();
    const loginForm = document.querySelector('#loginForm');
    const signupForm = document.querySelector('#signupForm');
    const fillDemoLogin = document.querySelector('#fillDemoLogin');

    fillDemoLogin?.addEventListener('click', () => {
      document.querySelector('#loginEmail').value = 'demo@fitos.app';
      document.querySelector('#loginPassword').value = 'password123';
      document.querySelector('#signupName').value = 'Demo User';
      document.querySelector('#signupEmail').value = 'demo@fitos.app';
      document.querySelector('#signupPassword').value = 'password123';
    });

    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await signIn({
          email: document.querySelector('#loginEmail').value,
          password: document.querySelector('#loginPassword').value,
        });
        state.section = 'dashboard';
        render();
      } catch (err) {
        alert(err?.message || 'Login failed.');
      }
    });

    signupForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await signUp({
          name: document.querySelector('#signupName').value,
          email: document.querySelector('#signupEmail').value,
          password: document.querySelector('#signupPassword').value,
        });
        state.section = 'onboarding';
        render();
      } catch (err) {
        alert(err?.message || 'Signup failed.');
      }
    });

    return;
  }

  renderApp();
}

bootAuth(() => render());
