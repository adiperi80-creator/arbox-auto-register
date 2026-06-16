import { readFileSync } from 'fs';
import { login, getMembership, getSchedule, registerForClass } from './arbox-client.mjs';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function loadConfig() {
  if (process.env.ARBOX_CONFIG) return JSON.parse(process.env.ARBOX_CONFIG);
  return JSON.parse(readFileSync(new URL('../config.json', import.meta.url), 'utf-8'));
}

function loadCredentials() {
  const email = process.env.ARBOX_EMAIL;
  const password = process.env.ARBOX_PASSWORD;
  if (!email || !password) {
    try {
      const lines = readFileSync(new URL('../.env', import.meta.url), 'utf-8').split('\n');
      const env = {};
      for (const line of lines) {
        const [key, ...rest] = line.split('=');
        if (key && rest.length) env[key.trim()] = rest.join('=').trim();
      }
      return { email: env.ARBOX_EMAIL, password: env.ARBOX_PASSWORD };
    } catch {
      throw new Error('Set ARBOX_EMAIL and ARBOX_PASSWORD in .env or environment variables');
    }
  }
  return { email, password };
}

function getDateRange(daysAhead = 7) {
  const dates = [];
  const now = new Date();
  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return { from: dates[0], to: dates[dates.length - 1], dates };
}

function matchClass(scheduleEntry, wantedClass) {
  const entryDate = new Date(scheduleEntry.date + 'T12:00:00');
  const dayName = DAYS[entryDate.getDay()];
  if (dayName !== wantedClass.day.toLowerCase()) return false;

  const entryTime = scheduleEntry.time?.substring(0, 5);
  if (entryTime !== wantedClass.time) return false;

  if (wantedClass.name) {
    const className = scheduleEntry.box_categories?.name?.toLowerCase() || '';
    if (!className.includes(wantedClass.name.toLowerCase())) return false;
  }

  return true;
}

function getTodayInIsrael() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    weekday: 'long',
  }).format(new Date()).toLowerCase();
}

async function main() {
  console.log(`\n=== Arbox Auto-Register ===`);
  console.log(`Time: ${new Date().toLocaleString('en-IL', { timeZone: 'Asia/Jerusalem' })}\n`);

  const config = loadConfig();

  if (config.registrationDay && !process.env.ARBOX_FORCE_RUN) {
    const today = getTodayInIsrael();
    if (today !== config.registrationDay.toLowerCase()) {
      console.log(`Today is ${today}. Registration day is ${config.registrationDay}. Skipping.\n`);
      return;
    }
  }

  const creds = loadCredentials();

  console.log(`Logging in as ${creds.email}...`);
  const auth = await login(creds.email, creds.password);
  console.log(`Logged in as ${auth.userName} (box: ${auth.boxId})`);

  const membershipUserId = await getMembership(auth);
  console.log(`Membership ID: ${membershipUserId}\n`);

  const { from, to } = getDateRange(7);
  console.log(`Fetching schedule ${from} → ${to}...`);
  const schedule = await getSchedule(auth, from, to);
  console.log(`Found ${schedule.length} classes in schedule\n`);

  const results = [];

  for (const wanted of config.classes) {
    const match = schedule.find(entry => matchClass(entry, wanted));

    if (!match) {
      const label = wanted.name ? `${wanted.name} on ${wanted.day} at ${wanted.time}` : `${wanted.day} at ${wanted.time}`;
      const msg = `[SKIP] No class found: ${label}`;
      console.log(msg);
      results.push({ ...wanted, status: 'not_found' });
      continue;
    }

    const label = `${match.box_categories?.name} — ${match.date} ${match.time} (${match.coach?.full_name || 'TBD'})`;

    if (match.user_booked) {
      console.log(`[OK] Already registered: ${label}`);
      results.push({ ...wanted, status: 'already_registered', label });
      continue;
    }

    const spotsLeft = match.free ?? (match.max_users - match.registered);

    try {
      await registerForClass(auth, match.id, membershipUserId);
      if (spotsLeft > 0) {
        console.log(`[REGISTERED] ${label} (${spotsLeft} spots were left)`);
        results.push({ ...wanted, status: 'registered', label });
      } else {
        console.log(`[WAITLIST] ${label} (class was full)`);
        results.push({ ...wanted, status: 'waitlist', label });
      }
    } catch (err) {
      console.log(`[ERROR] ${label}: ${err.message}`);
      results.push({ ...wanted, status: 'error', label, error: err.message });
    }
  }

  console.log('\n=== Summary ===');
  const counts = {};
  for (const r of results) {
    counts[r.status] = (counts[r.status] || 0) + 1;
  }
  for (const [status, count] of Object.entries(counts)) {
    console.log(`  ${status}: ${count}`);
  }

  const errors = results.filter(r => r.status === 'error');
  if (errors.length > 0) {
    console.error(`\n${errors.length} registration(s) failed`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`\nFatal error: ${err.message}`);
  process.exit(1);
});
