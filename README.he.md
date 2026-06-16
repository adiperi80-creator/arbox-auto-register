<div dir="rtl">

# Arbox Auto-Register — הרשמה אוטומטית

הרשמה אוטומטית לשיעורי כושר שבועיים ב-[Arbox](https://www.arboxapp.com) ברגע שההרשמה נפתחת. בלי לרוץ לתפוס מקום — הסקריפט עושה את זה בשבילך.

## איך זה עובד

שירות חינמי בשם **GitHub Actions** מריץ תוכנית קטנה כל יום בשעה 15:00 שעון ישראל. התוכנית:

1. בודקת אם היום הוא יום ההרשמה של חדר הכושר שלכם (ניתן להגדרה — ראו בהמשך)
2. מתחברת לחשבון Arbox שלך
3. בודקת את לוח השיעורים ל-7 ימים הקרובים
4. מוצאת את השיעורים שבחרת (לפי יום ושעה — שם השיעור הוא אופציונלי)
5. רושמת אותך לכל אחד מהם — או מצרפת לרשימת המתנה אם השיעור מלא
6. מדלגת על שיעורים שכבר נרשמת אליהם

---

## מה צריך לפני שמתחילים

צריך להתקין שתי תוכנות חינמיות על המחשב, ולוודא שיש לכם שני חשבונות מוכנים.

### 1. Node.js

Node.js הוא המנוע שמריץ את הסקריפט. צריך גרסה 18 ומעלה.

**מק:** היכנסו ל-[nodejs.org](https://nodejs.org/), הורידו את ה-**macOS Installer**, פתחו את הקובץ שירד ועקבו אחרי ההוראות.

**ווינדוס:** היכנסו ל-[nodejs.org](https://nodejs.org/), הורידו את ה-**Windows Installer (.msi)**, פתחו את הקובץ שירד ולחצו **Next** עד שזה נגמר.

כדי לבדוק שזה עבד, פתחו טרמינל (ראו למטה) והקלידו:

<div dir="ltr">

```
node --version
```

</div>

אתם צריכים לראות משהו כמו `v22.x.x`. כל מספר 18 ומעלה אומר שהכל בסדר.

### 2. Git

Git מאפשר להוריד את קבצי הפרויקט מ-GitHub.

**מק:** פתחו טרמינל והקלידו `git --version`. אם מופיע מספר גרסה, הכל בסדר. אם קופצת הודעה שמבקשת להתקין "command line developer tools", לחצו **Install** וחכו שזה יסתיים.

**ווינדוס:** היכנסו ל-[git-scm.com](https://git-scm.com/), לחצו על כפתור ההורדה, הריצו את ההתקנה ולחצו **Next** בכל מסך.

### 3. חשבון GitHub (חינם)

GitHub הוא המקום שבו ההרשמה האוטומטית רצה כל שבוע. אם אין לכם חשבון, היכנסו ל-[github.com/join](https://github.com/join) והירשמו — זה חינם.

### 4. חשבון Arbox

צריך מנוי פעיל לחדר כושר שמקושר ל-Arbox. זה אותו מייל וסיסמה שאתם משתמשים בהם באפליקציית Arbox בטלפון.

### איך פותחים טרמינל

טרמינל זה חלון שבו מקלידים פקודות. תשתמשו בו בצעדים הבאים.

- **מק:** פתחו את האפליקציה **Terminal**. אפשר למצוא אותה ב-Applications > Utilities, או ללחוץ `Cmd + Space` ולחפש "Terminal".
- **ווינדוס:** לחצו על מקש `Windows`, הקלידו **PowerShell** ולחצו Enter.

---

## התקנה (צעד אחר צעד)

### צעד 1: Fork של הריפו

"Fork" זה ליצור עותק אישי שלכם מהפרויקט ב-GitHub. אתם צריכים עותק משלכם כדי לשמור בו את ההגדרות האישיות שלכם.

1. ודאו שאתם מחוברים ל-[github.com](https://github.com)
2. היכנסו לדף הפרויקט ב-GitHub
3. לחצו על כפתור **Fork** בפינה הימנית-עליונה
4. בדף הבא, לחצו על **Create fork**
5. מוכן! עכשיו יש לכם עותק משלכם בכתובת `github.com/YOUR_USERNAME/arbox-auto-register`

### צעד 2: הורדה והרצת אשף ההגדרות

פתחו את הטרמינל והקלידו את שלוש הפקודות האלה, אחת אחרי השנייה. לחצו Enter אחרי כל אחת.

<div dir="ltr">

```
git clone https://github.com/YOUR_USERNAME/arbox-auto-register.git
cd arbox-auto-register
npm run setup
```

</div>

> **חשוב:** החליפו את `YOUR_USERNAME` בשם המשתמש שלכם ב-GitHub. למשל, אם שם המשתמש שלכם הוא `dana123`, הפקודה הראשונה תהיה:
> ```
> git clone https://github.com/dana123/arbox-auto-register.git
> ```

האשף:

1. ישאל את **כתובת המייל והסיסמה** שלכם ב-Arbox (הסיסמה תופיע על המסך בזמן ההקלדה)
2. יתחבר ויבדוק שהפרטים נכונים
3. יציג את **לוח השיעורים המלא** ל-7 ימים הקרובים
4. יאפשר לכם **לבחור שיעורים לפי מספר** — הקלידו את המספרים מופרדים בפסיקים (למשל: `1,3,5`)
5. ישאל **באיזה יום חדר הכושר פותח הרשמה** (למשל: `thursday`). אם תלחצו Enter בלי להקליד כלום, הסקריפט ינסה להירשם כל יום.
6. ישמור את הבחירות שלכם בשני קבצים על המחשב:
   - `config.json` — השיעורים שבחרתם ויום ההרשמה
   - `.env` — פרטי ההתחברות שלכם (הקובץ הזה נשאר על המחשב ולעולם לא עולה לשום מקום)

**ככה זה נראה:**

<div dir="ltr">

```
=== Arbox Auto-Register Setup ===

Arbox email: you@example.com
Arbox password: ********

Logging in...
Logged in as Israel Israeli (gym ID: 80)

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

</div>

### צעד 3: בדיקה

הריצו את הפקודה הזו כדי לוודא שהכל עובד:

**מק / לינוקס:**

<div dir="ltr">

```
ARBOX_FORCE_RUN=true npm run register
```

</div>

**ווינדוס (PowerShell):**

<div dir="ltr">

```
$env:ARBOX_FORCE_RUN="true"; npm run register
```

</div>

> החלק `ARBOX_FORCE_RUN` אומר לסקריפט לרוץ עכשיו, גם אם היום הוא לא יום ההרשמה שלכם. צריך את זה רק לבדיקות — ההרצות האוטומטיות השבועיות מטפלות בזה לבד.

אתם צריכים לראות משהו כזה:

<div dir="ltr">

```
=== Arbox Auto-Register ===
Time: 14/06/2026, 15:00:00

Logging in as you@example.com...
Logged in as Israel Israeli (box: 80)
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

</div>

אם אתם רואים `[REGISTERED]` או `[OK]`, זה עובד.

### צעד 4: הוספת Secrets ב-GitHub

עכשיו צריך לתת ל-GitHub את פרטי ההתחברות שלכם כדי שהוא יוכל להריץ את הסקריפט אוטומטית כל שבוע. אל דאגה — הפרטים שלכם **מוצפנים** (מוגנים בקוד סודי) ואף אחד לא יכול לראות אותם, אפילו לא GitHub.

1. היכנסו לריפו שלכם ב-GitHub:&rlm; `github.com/YOUR_USERNAME/arbox-auto-register`
2. לחצו על טאב **Settings** בחלק העליון של הדף
3. בצד שמאל, לחצו על **Secrets and variables**, ואז לחצו על **Actions**
4. לחצו על הכפתור הירוק **New repository secret**

צריך להוסיף **שלושה** secrets. אחרי כל אחד, לחצו **Add secret** ואז לחצו שוב על **New repository secret** בשביל הבא.

**Secret 1:**
- **Name:**&rlm; `ARBOX_EMAIL`
- **Secret:** כתובת המייל שלכם ב-Arbox (למשל:&rlm; `you@example.com`)

**Secret 2:**
- **Name:**&rlm; `ARBOX_PASSWORD`
- **Secret:** הסיסמה שלכם ב-Arbox

**Secret 3:**
- **Name:**&rlm; `ARBOX_CONFIG`
- **Secret:** טקסט ה-JSON שהודפס בסוף `npm run setup`. העתיקו והדביקו אותו בדיוק כפי שהוא.

זה נראה בערך ככה (שורה ארוכה אחת):

<div dir="ltr">

```json
{"registrationDay":"thursday","classes":[{"day":"sunday","time":"07:00","name":"CrossFit"},{"day":"sunday","time":"18:30"},{"day":"monday","time":"07:00","name":"WOD"}]}
```

</div>

### צעד 5: בדיקה שזה עובד ב-GitHub

1. היכנסו לטאב **Actions** בחלק העליון של הריפו
2. בצד שמאל תראו **Arbox Auto-Register** — לחצו עליו
3. לחצו על הכפתור **Run workflow** (בצד ימין), ואז לחצו על הכפתור הירוק **Run workflow**
4. חכו בערך 30 שניות, ואז לחצו על ההרצה שהופיעה כדי לראות מה קרה
5. אם אתם רואים שהשיעורים נרשמו — סיימתם!

מכאן והלאה, הסקריפט רץ אוטומטית כל יום בשעה 15:00 שעון ישראל, אבל עושה הרשמה בפועל רק ביום ההרשמה שהגדרתם. לא צריך לעשות שום דבר נוסף.

---

## שינוי השיעורים

רוצים להירשם לשיעורים אחרים? ככה עושים את זה.

### אפשרות א׳: להריץ את אשף ההגדרות מחדש

פתחו את הטרמינל והקלידו:

<div dir="ltr">

```
cd arbox-auto-register
npm run setup
```

</div>

בחרו את השיעורים החדשים. אחר כך היכנסו ל-GitHub ועדכנו את ה-secret בשם `ARBOX_CONFIG`:

1. היכנסו ל-Settings, ואז Secrets and variables, ואז Actions
2. לחצו על `ARBOX_CONFIG`
3. לחצו על **Update**
4. הדביקו את ה-JSON החדש ושמרו

### אפשרות ב׳: לערוך את קובץ ההגדרות ידנית

פתחו את `config.json` בעורך טקסט כלשהו (Notepad, TextEdit או VS Code) ושנו:

<div dir="ltr">

```json
{
  "registrationDay": "thursday",
  "classes": [
    { "day": "sunday", "time": "07:00", "name": "CrossFit" },
    { "day": "tuesday", "time": "18:30" }
  ]
}
```

</div>

ואז עדכנו את ה-secret `ARBOX_CONFIG` ב-GitHub עם אותו טקסט (בשורה אחת).

### מה כל שדה אומר

| שדה | חובה? | מה לכתוב | דוגמה |
|-----|-------|-----------|-------|
| `registrationDay` | אופציונלי | היום שבו חדר הכושר פותח הרשמה. אם לא מוגדר, הסקריפט רץ כל יום. | `thursday` |
| `day` | כן | יום בשבוע באנגלית, באותיות קטנות | `sunday`&rlm;, `monday`&rlm;, `tuesday` |
| `time` | כן | שעת התחלת השיעור, בדיוק כפי שמופיעה ב-Arbox | `07:00`&rlm;, `18:30` |
| `name` | אופציונלי | שם סוג השיעור — מספיקה התאמה חלקית. אם לא מוגדר, יום + שעה מספיקים לזיהוי השיעור. | `CrossFit` מתאים גם ל-"crossfit" ול-"CrossFit WOD" |

---

## הרצה על המחשב שלכם (מתקדם)

אם אתם מעדיפים לא להשתמש ב-GitHub Actions, אפשר להגדיר את הסקריפט לרוץ אוטומטית על המחשב שלכם כל שבוע.

### מק (באמצעות launchd)

צרו את הקובץ `~/Library/LaunchAgents/com.arbox-register.plist` עם התוכן הבא:

<div dir="ltr">

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

</div>

החליפו כל `/path/to/arbox-auto-register` בנתיב האמיתי על המחשב שלכם. אחר כך הריצו:

<div dir="ltr">

```
launchctl load ~/Library/LaunchAgents/com.arbox-register.plist
```

</div>

> **הערה:** הנתיב של Node.js&rlm; (`/opt/homebrew/bin/node`) יכול להיות שונה אצלכם. הריצו `which node` כדי למצוא את הנתיב.

### ווינדוס (באמצעות Task Scheduler)

1. לחצו על מקש `Windows` וחפשו **Task Scheduler** — פתחו אותו
2. לחצו על **Create Basic Task** בצד ימין
3. תנו את השם `Arbox Auto-Register` ולחצו **Next**
4. בחרו **Weekly** ולחצו **Next**
5. הגדירו שירוץ כל **Thursday** (יום חמישי) בשעה **15:00** ולחצו **Next**
6. בחרו **Start a Program** ולחצו **Next**
7. מלאו:
   - **Program:**&rlm; `node` (או הנתיב המלא — הריצו `where node` ב-PowerShell כדי למצוא)
   - **Arguments:**&rlm; `src/register.mjs`
   - **Start in:** הנתיב המלא לתיקייה `arbox-auto-register` (למשל:&rlm; `C:\Users\YourName\arbox-auto-register`)
8. לחצו **Finish**

### לינוקס (באמצעות cron)

הריצו `crontab -e` והוסיפו את השורה (שנו את הנתיב):

<div dir="ltr">

```
0 15 * * 4 cd /path/to/arbox-auto-register && /usr/bin/node src/register.mjs >> logs/stdout.log 2>&1
```

</div>

---

## אזור זמן ושעון קיץ

ישראל עוברת בין שעון חורף (IST, UTC+2) לשעון קיץ (IDT, UTC+3). ה-GitHub Actions מטפל בזה על ידי הרצה **בשתי השעות** כל יום: 12:00 UTC ו-13:00 UTC. אחת מהן תמיד תהיה 15:00 בישראל.

הסקריפט בודק את הגדרת `registrationDay` ומדלג על ימים שלא תואמים. הוא גם מדלג על שיעורים שכבר נרשמתם אליהם. אז הרצה כפולה באותו יום לא גורמת לשום בעיה.

---

## פתרון בעיות

**"inCorrectLoginDetails"**
המייל או הסיסמה שגויים. נסו להתחבר ל-[אתר Arbox](https://www.arboxapp.com/client-login) עם אותו מייל וסיסמה כדי לוודא שהם עובדים.

**"No gym (box) found on your account"**
חשבון ה-Arbox שלכם לא מקושר לחדר כושר. פנו לחדר הכושר ובקשו שיקשרו את החשבון שלכם ב-Arbox.

**"No active membership found"**
ייתכן שהמנוי שלכם פג תוקף. בדקו את סטטוס המנוי באפליקציית Arbox.

**"No class found: CrossFit on sunday at 07:00"**
שם השיעור, השעה או היום לא תואמים למה שבלוח. סיבות נפוצות:
- שם השיעור ב-Arbox שונה (למשל "WOD" במקום "CrossFit"). הריצו `npm run setup` כדי לראות שמות מדויקים.
- פורמט השעה שגוי — תמיד כתבו שתי ספרות לשעה, כמו `07:00` (לא `7:00`).
- חדר הכושר עדיין לא פרסם את לוח השיעורים לשבוע הבא.

**"Class is full" / רשימת המתנה**
הסקריפט מצרף אתכם אוטומטית לרשימת ההמתנה כשהשיעור מלא. תראו `[WAITLIST]` בפלט. בדקו את המיקום שלכם ברשימת ההמתנה באפליקציית Arbox.

**GitHub Actions הפסיק לרוץ**
GitHub מכבה אוטומטית תהליכים אחרי **60 יום ללא פעילות** בריפו. כדי לתקן, היכנסו לטאב Actions ולחצו על **Run workflow** כדי להפעיל ידנית. זה מפעיל מחדש את התזמון האוטומטי.

**GitHub Actions רץ אבל לא קורה כלום**
- ודאו שכל שלושת ה-secrets מוגדרים נכון: `ARBOX_EMAIL`&rlm;, `ARBOX_PASSWORD`&rlm;, `ARBOX_CONFIG`.
- בדקו שה-secret `ARBOX_CONFIG` מכיל JSON תקין — הוא צריך להתחיל ב-`{` ולהסתיים ב-`}`.

---

## שאלות נפוצות

**האם הסיסמה שלי מאובטחת?**
כן. ב-GitHub, הפרטים שלכם נשמרים כ-[secrets מוצפנים](https://docs.github.com/en/actions/security-guides/encrypted-secrets) — הם מוגנים ולא מוצגים בלוגים. על המחשב, הם שמורים בקובץ `.env` שלעולם לא עולה ל-GitHub.

**מה אם חדר הכושר עדיין לא פרסם את לוח השיעורים?**
הסקריפט יכתוב "No class found" לאותם שיעורים. אם זה קורה הרבה, ייתכן שחדר הכושר שלכם פותח הרשמה בזמן אחר. תשאלו אותם מתי ההרשמה נפתחת.

**אפשר להירשם לאותו סוג שיעור בכמה שעות?**
כן! פשוט הוסיפו כמה רשומות עם אותו שם שיעור אבל שעות שונות. למשל, CrossFit ב-07:00 ו-CrossFit ב-18:30.

**איך משנים את לוח השיעורים שלי?**
הריצו `npm run setup` מחדש כדי לבחור שיעורים חדשים, או ערכו את `config.json` ידנית. ואז עדכנו את ה-secret `ARBOX_CONFIG` ב-GitHub.

**האם זה עובד עם כמה סניפים?**
כרגע הסקריפט משתמש בסניף הראשון בחשבון שלכם. אם צריך סניף ספציפי, פתחו issue ב-GitHub.

---

## מבנה הפרויקט

<div dir="ltr">

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
├── README.md              # English documentation
└── README.he.md           # Hebrew documentation (this file)
```

</div>

## רישיון

MIT

</div>
