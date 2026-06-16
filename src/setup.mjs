import { createInterface } from 'readline';
import { readFileSync, writeFileSync } from 'fs';
import { login, getMembership, getSchedule } from './arbox-client.mjs';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const VALID_TIME = /^\d{2}:\d{2}$/;

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function confirm(question) {
  const answer = await ask(`${question} (y/n): `);
  return answer.trim().toLowerCase() !== 'n';
}

function loadExistingEnv() {
  try {
    const lines = readFileSync(new URL('../.env', import.meta.url), 'utf-8').split('\n');
    const env = {};
    for (const line of lines) {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) env[key.trim()] = rest.join('=').trim();
    }
    if (env.ARBOX_EMAIL && env.ARBOX_PASSWORD) return env;
  } catch {}
  return null;
}

function loadExistingConfig() {
  try {
    return JSON.parse(readFileSync(new URL('../config.json', import.meta.url), 'utf-8'));
  } catch {}
  return null;
}

async function selectFromSchedule(allClasses) {
  console.log('Enter the numbers of classes you want (e.g., 1,3,5).\n');
  const selection = await ask('Select classes: ');
  const selectedNums = selection.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

  return selectedNums
    .map(n => allClasses.find(c => c.idx === n))
    .filter(Boolean)
    .map(c => ({ day: c.dayName, time: c.time, name: c.name }));
}

async function enterManually() {
  console.log('Enter your classes one by one.\n');

  const classes = [];
  let i = 1;
  while (true) {
    console.log(`Class ${i}:`);

    let day;
    while (true) {
      const dayInput = await ask('  Day (e.g., sunday): ');
      day = dayInput.trim().toLowerCase();
      if (DAYS.includes(day)) break;
      console.log(`  "${dayInput.trim()}" is not a valid day. Try again.`);
    }

    let time;
    while (true) {
      const timeInput = await ask('  Time (e.g., 07:00): ');
      time = timeInput.trim();
      if (VALID_TIME.test(time)) break;
      console.log(`  "${time}" is not valid. Use HH:MM format (e.g., 07:00). Try again.`);
    }

    const nameInput = await ask('  Class name (optional, press Enter to skip): ');
    const entry = { day, time };
    if (nameInput.trim()) entry.name = nameInput.trim();
    classes.push(entry);
    i++;

    console.log();
    if (!await confirm('Add another class?')) break;
    console.log();
  }
  return classes;
}

async function main() {
  console.log('\n=== Arbox Auto-Register Setup ===\n');

  // --- Credentials ---
  let email, password;
  const existingEnv = loadExistingEnv();
  if (existingEnv) {
    console.log(`Found saved credentials for ${existingEnv.ARBOX_EMAIL}.`);
    if (await confirm('Use these?')) {
      email = existingEnv.ARBOX_EMAIL;
      password = existingEnv.ARBOX_PASSWORD;
    }
    console.log();
  }
  if (!email) {
    email = await ask('Arbox email: ');
    password = await ask('Arbox password: ');
    console.log();
  }

  // --- Login ---
  console.log('Logging in...');
  let auth;
  try {
    auth = await login(email, password);
  } catch (err) {
    console.error(`Login failed: ${err.message}`);
    process.exit(1);
  }
  console.log(`Logged in as ${auth.userName} (gym ID: ${auth.boxId})\n`);

  const membershipUserId = await getMembership(auth);

  // --- Fetch schedule ---
  const today = new Date();
  const from = today.toISOString().split('T')[0];
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);
  const to = endDate.toISOString().split('T')[0];

  console.log(`Fetching schedule for ${from} → ${to}...\n`);
  const schedule = await getSchedule(auth, from, to);

  const grouped = {};
  for (const entry of schedule) {
    const date = entry.date;
    const dayName = DAYS[new Date(date + 'T12:00:00').getDay()];
    if (!grouped[date]) grouped[date] = { dayName, classes: [] };
    grouped[date].classes.push(entry);
  }

  const allClasses = [];
  let idx = 1;

  if (Object.keys(grouped).length > 0) {
    console.log('Available classes:\n');
    for (const [date, { dayName, classes }] of Object.entries(grouped).sort()) {
      console.log(`  ${dayName.toUpperCase()} (${date}):`);
      for (const c of classes.sort((a, b) => a.time.localeCompare(b.time))) {
        const name = c.box_categories?.name || 'Unknown';
        const coach = c.coach?.full_name || 'TBD';
        const spots = c.free ?? '?';
        const booked = c.user_booked ? ' [BOOKED]' : '';
        console.log(`    ${idx}. ${c.time} ${name} — ${coach} (${spots} spots)${booked}`);
        allClasses.push({ idx, date, dayName, time: c.time.substring(0, 5), name, coach, entry: c });
        idx++;
      }
      console.log();
    }
  } else {
    console.log('No classes found in the schedule for the next 7 days.\n');
  }

  // --- Check existing config ---
  const existingConfig = loadExistingConfig();
  let selectedClasses = null;
  let regDay = null;
  let regTime = null;

  if (existingConfig?.classes?.length) {
    console.log('--- Current config ---\n');
    console.log('Classes:');
    for (const c of existingConfig.classes) {
      console.log(`  ${c.day} ${c.time}${c.name ? ` — ${c.name}` : ''}`);
    }
    const day = existingConfig.registrationDay || 'every day';
    const time = existingConfig.registrationTime || '15:00';
    console.log(`\nRegistration schedule: ${day} at ${time}\n`);

    if (!await confirm('Change class selection?')) {
      selectedClasses = existingConfig.classes;
    }

    if (!await confirm('Change registration schedule?')) {
      regDay = existingConfig.registrationDay || null;
      regTime = existingConfig.registrationTime || '15:00';
    }
    console.log();
  }

  // --- Class selection (if needed) ---
  if (!selectedClasses) {
    if (allClasses.length > 0) {
      console.log('How do you want to select classes?');
      console.log('  1. Pick from the schedule above (by number)');
      console.log('  2. Enter day + time manually\n');
      const method = await ask('Choose 1 or 2: ');

      if (method.trim() === '2') {
        selectedClasses = await enterManually();
      } else {
        selectedClasses = await selectFromSchedule(allClasses);
      }
    } else {
      console.log('You can enter your classes manually by day and time.\n');
      selectedClasses = await enterManually();
    }

    if (selectedClasses.length === 0) {
      console.log('No classes selected. Exiting.');
      process.exit(0);
    }
  }

  // --- Registration schedule (if needed) ---
  if (regTime === null) {
    console.log('\n--- Registration schedule ---\n');
    console.log('When does your gym open registration for next week?\n');

    const regDayInput = await ask('Registration day (e.g., thursday, or press Enter for every day): ');
    const dayVal = regDayInput.trim().toLowerCase();
    if (dayVal && !DAYS.includes(dayVal)) {
      console.log(`Warning: "${dayVal}" is not a valid day. Running every day instead.`);
    }
    regDay = dayVal && DAYS.includes(dayVal) ? dayVal : null;

    const regTimeInput = await ask('Registration time in HH:MM (or press Enter for 15:00): ');
    const timeVal = regTimeInput.trim() || '15:00';
    if (!VALID_TIME.test(timeVal)) {
      console.log(`Warning: "${timeVal}" is not a valid time. Using 15:00 instead.`);
    }
    regTime = VALID_TIME.test(timeVal) ? timeVal : '15:00';
  }

  // --- Save ---
  const config = {
    ...(regDay ? { registrationDay: regDay } : {}),
    registrationTime: regTime,
    classes: selectedClasses,
  };

  const configPath = new URL('../config.json', import.meta.url);
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`\nSaved ${config.classes.length} classes to config.json:`);
  for (const c of config.classes) {
    console.log(`  ${c.day} ${c.time}${c.name ? ` — ${c.name}` : ''}`);
  }

  const envPath = new URL('../.env', import.meta.url);
  writeFileSync(envPath, `ARBOX_EMAIL=${email}\nARBOX_PASSWORD=${password}\n`);
  console.log('\nSaved credentials to .env');

  console.log('\n=== Next Steps ===');
  console.log('1. Test locally:   ARBOX_FORCE_RUN=true npm run register');
  console.log('2. Push to GitHub and add these secrets:');
  console.log(`   ARBOX_EMAIL     = ${email}`);
  console.log(`   ARBOX_PASSWORD  = (your password)`);
  console.log(`   ARBOX_CONFIG    = ${JSON.stringify(config)}`);
  const dayMsg = regDay ? `every ${regDay}` : 'every day';
  console.log(`3. GitHub Actions will run ${dayMsg} at ${regTime} Israel time.\n`);

  rl.close();
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  rl.close();
  process.exit(1);
});
