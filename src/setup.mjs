import { createInterface } from 'readline';
import { writeFileSync } from 'fs';
import { login, getMembership, getSchedule } from './arbox-client.mjs';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function main() {
  console.log('\n=== Arbox Auto-Register Setup ===\n');

  const email = await ask('Arbox email: ');
  const password = await ask('Arbox password: ');

  console.log('\nLogging in...');
  let auth;
  try {
    auth = await login(email, password);
  } catch (err) {
    console.error(`Login failed: ${err.message}`);
    process.exit(1);
  }
  console.log(`Logged in as ${auth.userName} (gym ID: ${auth.boxId})\n`);

  const membershipUserId = await getMembership(auth);

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

  console.log('Available classes:\n');
  const allClasses = [];
  let idx = 1;

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

  console.log('Enter the numbers of classes you want to auto-register for.');
  console.log('Separate with commas (e.g., 1,3,5,12) or type "done" to finish.\n');

  const selection = await ask('Select classes: ');
  const selectedNums = selection.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

  const selectedClasses = selectedNums
    .map(n => allClasses.find(c => c.idx === n))
    .filter(Boolean);

  if (selectedClasses.length === 0) {
    console.log('No classes selected. Exiting.');
    process.exit(0);
  }

  console.log('Which day does your gym open registration for next week?');
  console.log('Common choices: thursday, sunday, etc.');
  const regDayInput = await ask('Registration day (or press Enter to run every day): ');
  const regDay = regDayInput.trim().toLowerCase();
  const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  if (regDay && !validDays.includes(regDay)) {
    console.log(`Warning: "${regDay}" is not a valid day. Running every day instead.`);
  }

  const config = {
    ...(regDay && validDays.includes(regDay) ? { registrationDay: regDay } : {}),
    classes: selectedClasses.map(c => ({
      day: c.dayName,
      time: c.time,
      name: c.name,
    })),
  };

  const configPath = new URL('../config.json', import.meta.url);
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`\nSaved ${config.classes.length} classes to config.json:`);
  for (const c of config.classes) {
    console.log(`  ${c.day} ${c.time} — ${c.name}`);
  }

  const envPath = new URL('../.env', import.meta.url);
  writeFileSync(envPath, `ARBOX_EMAIL=${email}\nARBOX_PASSWORD=${password}\n`);
  console.log('\nSaved credentials to .env');

  console.log('\n=== Next Steps ===');
  console.log('1. Test locally:   npm run register');
  console.log('2. Push to GitHub and add these secrets:');
  console.log(`   ARBOX_EMAIL     = ${email}`);
  console.log(`   ARBOX_PASSWORD  = (your password)`);
  console.log(`   ARBOX_CONFIG    = ${JSON.stringify(config)}`);
  const dayMsg = config.registrationDay
    ? `GitHub Actions will run every ${config.registrationDay} at 3pm Israel time.`
    : 'GitHub Actions will run every day at 3pm Israel time.';
  console.log(`3. ${dayMsg}\n`);

  rl.close();
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  rl.close();
  process.exit(1);
});
