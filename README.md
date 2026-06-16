# Arbox Auto-Register

Automatically sign up for your weekly fitness classes on [Arbox](https://www.arboxapp.com) the moment registration opens. No more racing to grab a spot — the script does it for you.

## How It Works

A free service called **GitHub Actions** runs a small program every day at 3:00 PM Israel time. The program:
1. Checks if today is your gym's registration day (configurable — see setup)
2. Logs into your Arbox account
3. Checks the gym schedule for the next 7 days
4. Finds the classes you picked (by day and time — class name is optional)
5. Signs you up for each one — or puts you on the waitlist if the class is full
6. Skips classes you're already signed up for

---

## What You Need

Before you start, you need to install two free programs on your computer and have two accounts ready.

### 1. Node.js

Node.js is the engine that runs the script. You need version 18 or higher.

**Mac:** Go to [nodejs.org](https://nodejs.org/), download the **macOS Installer**, open the downloaded file, and follow the steps.

**Windows:** Go to [nodejs.org](https://nodejs.org/), download the **Windows Installer (.msi)**, open the downloaded file, and click **Next** until it finishes.

To check that it worked, open a terminal (see below) and type:
```
node --version
```
You should see something like `v22.x.x`. Any number 18 or higher means you're good.

### 2. Git

Git lets you download the project files from GitHub.

**Mac:** Open Terminal and type `git --version`. If you see a version number, you're good. If a popup appears asking you to install "command line developer tools", click **Install** and wait for it to finish.

**Windows:** Go to [git-scm.com](https://git-scm.com/), click the download button, run the installer, and click **Next** on every screen.

### 3. A GitHub Account (free)

GitHub is where the automatic weekly registration runs. If you don't have an account, go to [github.com/join](https://github.com/join) and sign up — it's free.

### 4. An Arbox Account

You need an active gym membership linked to Arbox. This is the same email and password you use to log into the Arbox phone app.

### How to Open a Terminal

A terminal is a window where you type commands. You'll use it in the next steps.

- **Mac:** Open the app called **Terminal**. You can find it in Applications > Utilities, or press `Cmd + Space` and search for "Terminal".
- **Windows:** Press the `Windows` key, type **PowerShell**, and press Enter.

---

## Setup (Step by Step)

### Step 1: Fork the Repository

"Forking" means making your own copy of this project on GitHub. You need your own copy so you can store your personal settings there.

1. Make sure you're logged into [github.com](https://github.com)
2. Go to this project's page on GitHub
3. Click the **Fork** button in the top-right corner
4. On the next page, click **Create fork**
5. Done! You now have your own copy at `github.com/YOUR_USERNAME/arbox-auto-register`

### Step 2: Download and Run the Setup Wizard

Open your terminal and type these three commands, one at a time. Press Enter after each one.

```
git clone https://github.com/YOUR_USERNAME/arbox-auto-register.git
cd arbox-auto-register
npm run setup
```

> **Important:** Replace `YOUR_USERNAME` with your actual GitHub username. For example, if your username is `dana123`, the first command would be:
> ```
> git clone https://github.com/dana123/arbox-auto-register.git
> ```

The setup wizard will:
1. Ask for your **Arbox email** and **password** (the password will show on screen as you type)
2. Log in and check that your details are correct
3. Show you the full class schedule for the next 7 days
4. Let you **pick classes by number** — type the numbers separated by commas (for example: `1,3,5`)
5. Ask which **day your gym opens registration** (for example: `thursday`). If you press Enter without typing anything, the script will try to register every day.
6. Save your choices to two files on your computer:
   - `config.json` — the classes you picked and your registration day
   - `.env` — your login details (this file stays on your computer and is never uploaded anywhere)

**Here's what it looks like:**
```
=== Arbox Auto-Register Setup ===

Arbox email: you@example.com
Arbox password: ********

Logging in...
Logged in as John Doe (gym ID: 80)

Fetching schedule for 2026-06-14 → 2026-06-21...

Available classes:

  SUNDAY (2026-06-15):
    1. 06:00 CrossFit — Coach A (8 spots)
    2. 07:00 CrossFit — Coach B (12 spots)
    3. 08:00 Open Gym — Coach C (20 spots)
    4. 18:30 CrossFit — Coach A (5 spots)

  MONDAY (2026-06-16):
    5. 06:00 CrossFit — Coach B (10 spots)
    6. 07:00 WOD — Coach A (8 spots)
    ...

Select classes: 2,4,6

Which day does your gym open registration for next week?
Common choices: thursday, sunday, etc.
Registration day (or press Enter to run every day): thursday
```

### Step 3: Test It

Run this command to make sure everything works:

**Mac / Linux:**
```
ARBOX_FORCE_RUN=true npm run register
```

**Windows (PowerShell):**
```
$env:ARBOX_FORCE_RUN="true"; npm run register
```

> The `ARBOX_FORCE_RUN` part tells the script to run right now, even if today isn't your registration day. You only need this for testing — the automatic weekly runs handle it on their own.

You should see something like:
```
=== Arbox Auto-Register ===
Time: 14/06/2026, 15:00:00

Logging in as you@example.com...
Logged in as John Doe (box: 80)
Membership ID: 54321

Fetching schedule 2026-06-14 → 2026-06-21...
Found 42 classes in schedule

[REGISTERED] CrossFit — 2026-06-15 07:00 (Coach B) (12 spots were left)
[REGISTERED] CrossFit — 2026-06-15 18:30 (Coach A) (5 spots were left)
[OK] Already registered: WOD — 2026-06-16 07:00 (Coach A)

=== Summary ===
  registered: 2
  already_registered: 1
```

If you see `[REGISTERED]` or `[OK]`, it's working.

### Step 4: Add Your Secrets to GitHub

Now you need to give GitHub your login details so it can run the script automatically every week. Don't worry — your details are **encrypted** (protected with a secret code) and nobody can see them, not even GitHub.

1. Go to your forked repo on GitHub: `github.com/YOUR_USERNAME/arbox-auto-register`
2. Click the **Settings** tab at the top of the page
3. On the left side, click **Secrets and variables**, then click **Actions**
4. Click the green **New repository secret** button

You need to add **three** secrets. After adding each one, click **Add secret** and then click **New repository secret** again for the next one.

**Secret 1:**
- **Name:** `ARBOX_EMAIL`
- **Secret:** Your Arbox email address (example: `you@example.com`)

**Secret 2:**
- **Name:** `ARBOX_PASSWORD`
- **Secret:** Your Arbox password

**Secret 3:**
- **Name:** `ARBOX_CONFIG`
- **Secret:** The JSON text that was printed at the end of `npm run setup`. Copy and paste it exactly as shown.

It looks something like this (one long line):
```json
{"registrationDay":"thursday","classes":[{"day":"sunday","time":"07:00","name":"CrossFit"},{"day":"sunday","time":"18:30"},{"day":"monday","time":"07:00","name":"WOD"}]}
```

### Step 5: Check That It Works on GitHub

1. Go to the **Actions** tab at the top of your repo
2. Click **Arbox Auto-Register** on the left side
3. Click the **Run workflow** dropdown (right side), then click the green **Run workflow** button
4. Wait about 30 seconds, then click on the run that appeared
5. If you see your classes listed as registered — you're done!

From now on, the script runs automatically every day at 3:00 PM Israel time, but only does the actual registration on your configured registration day. You don't need to do anything else.

---

## Changing Your Classes

Want to sign up for different classes? Here's how.

### Option A: Run the Setup Wizard Again

Open your terminal and type:
```
cd arbox-auto-register
npm run setup
```

Pick your new classes. Then go to GitHub and update the `ARBOX_CONFIG` secret with the new JSON:
1. Go to Settings > Secrets and variables > Actions
2. Click on `ARBOX_CONFIG`
3. Click **Update**
4. Paste the new JSON and save

### Option B: Edit the Config File by Hand

Open `config.json` in any text editor (Notepad, TextEdit, or VS Code) and change it:
```json
{
  "registrationDay": "thursday",
  "classes": [
    { "day": "sunday", "time": "07:00", "name": "CrossFit" },
    { "day": "tuesday", "time": "18:30" }
  ]
}
```

Then update the `ARBOX_CONFIG` secret on GitHub with the same text (as one line).

### What the Fields Mean

| Field | Required? | What to Write | Example |
|-------|-----------|---------------|---------|
| `registrationDay` | Optional | The day your gym opens registration. If not set, the script runs every day. | `thursday` |
| `day` | Yes | Day of the week in English, all lowercase | `sunday`, `monday`, `tuesday` |
| `time` | Yes | Class start time, exactly as shown in Arbox | `07:00`, `18:30` |
| `name` | Optional | Class type name — a partial match is enough. If not set, day + time is used to find the class. | `CrossFit` also matches "crossfit" and "CrossFit WOD" |

---

## Running on Your Own Computer (Advanced)

If you prefer not to use GitHub Actions, you can set up the script to run automatically on your own computer every week.

### Mac (using launchd)

Create the file `~/Library/LaunchAgents/com.arbox-register.plist` with this content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.arbox-register</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/node</string>
        <string>/path/to/arbox-auto-register/src/register.mjs</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/path/to/arbox-auto-register</string>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>4</integer>
        <key>Hour</key>
        <integer>15</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/path/to/arbox-auto-register/logs/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/path/to/arbox-auto-register/logs/stderr.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    </dict>
</dict>
</plist>
```

Replace every `/path/to/arbox-auto-register` with the real path on your computer. Then run:

```
launchctl load ~/Library/LaunchAgents/com.arbox-register.plist
```

> **Note:** The Node.js path (`/opt/homebrew/bin/node`) might be different on your Mac. Run `which node` to find yours.

### Windows (using Task Scheduler)

1. Press the `Windows` key and search for **Task Scheduler** — open it
2. Click **Create Basic Task** on the right side
3. Name it `Arbox Auto-Register` and click **Next**
4. Select **Weekly** and click **Next**
5. Set it to run every **Thursday** at **15:00** (3:00 PM) and click **Next**
6. Select **Start a Program** and click **Next**
7. Fill in:
   - **Program:** `node` (or the full path — run `where node` in PowerShell to find it)
   - **Arguments:** `src/register.mjs`
   - **Start in:** the full path to your `arbox-auto-register` folder (for example: `C:\Users\YourName\arbox-auto-register`)
8. Click **Finish**

### Linux (using cron)

Run `crontab -e` and add this line (change the path to match yours):
```
0 15 * * 4 cd /path/to/arbox-auto-register && /usr/bin/node src/register.mjs >> logs/stdout.log 2>&1
```

---

## Timezone and Daylight Saving

Israel switches between winter time (IST, UTC+2) and summer time (IDT, UTC+3). The GitHub Actions workflow handles this by running at **two times** every day: 12:00 UTC and 13:00 UTC. One of them will always be 3:00 PM in Israel.

The script checks your `registrationDay` setting and skips days that don't match. It also skips classes you're already signed up for. So running twice on the same day doesn't cause any problems.

---

## Troubleshooting

**"inCorrectLoginDetails"**
Your email or password is wrong. Try logging into the [Arbox website](https://www.arboxapp.com/client-login) with the same email and password to make sure they work.

**"No gym (box) found on your account"**
Your Arbox account isn't connected to a gym. Contact your gym and ask them to link your account in Arbox.

**"No active membership found"**
Your gym membership may have expired. Check your membership status in the Arbox app.

**"No class found: CrossFit on sunday at 07:00"**
The class name, time, or day doesn't match what's in the schedule. Common reasons:
- The class has a different name in Arbox (for example, "WOD" instead of "CrossFit"). Run `npm run setup` to see the exact names.
- The time format is wrong — always use two digits for hours, like `07:00` (not `7:00`).
- The gym hasn't published next week's schedule yet.

**"Class is full" / Waitlist**
The script automatically puts you on the waitlist when a class is full. You'll see `[WAITLIST]` in the output. Check your waitlist position in the Arbox app.

**GitHub Actions stopped running**
GitHub automatically disables workflows after **60 days of no activity** in your repo. To fix it, go to the Actions tab and click **Run workflow** to trigger it manually. This re-enables the automatic schedule.

**GitHub Actions runs but nothing happens**
- Make sure all three secrets (`ARBOX_EMAIL`, `ARBOX_PASSWORD`, `ARBOX_CONFIG`) are set correctly.
- Check that your `ARBOX_CONFIG` secret contains valid JSON — it should start with `{` and end with `}`.

---

## FAQ

**Is my password safe?**
Yes. On GitHub, your credentials are stored as [encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) — they're protected and never shown in logs. On your computer, they're saved in a `.env` file that is never uploaded to GitHub.

**What if the gym hasn't published next week's schedule yet?**
The script will say "No class found" for those classes. If this happens often, your gym might open registration at a different time. Ask them when registration opens and adjust accordingly.

**Can I register for the same class type at different times?**
Yes! Just add multiple entries with the same class name but different times. For example, CrossFit at 07:00 and CrossFit at 18:30.

**How do I change my class schedule?**
Run `npm run setup` again to pick new classes, or edit `config.json` by hand. Then update the `ARBOX_CONFIG` secret on GitHub.

**Does it work with multiple gym locations?**
Currently it uses the first location on your account. If you need a specific location, open an issue on GitHub.

---

## Project Structure

```
arbox-auto-register/
├── src/
│   ├── arbox-client.mjs   # Arbox API client (login, schedule, register)
│   ├── register.mjs       # Main script — finds and registers for classes
│   └── setup.mjs          # Interactive setup wizard
├── .github/workflows/
│   └── register.yml       # GitHub Actions schedule (daily 3pm Israel)
├── config.example.json    # Example class config
├── .env.example           # Example credentials file
├── package.json
└── README.md
```

## License

MIT
