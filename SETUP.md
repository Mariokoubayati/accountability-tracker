# Accountability Tracker — Setup Guide

> Built with Claude Code. This file contains everything you need to go from repo → running iPhone app.

---

## What was built

A production-ready personal accountability tracker iOS app:
- **Habit tracking** with daily logging and streaks
- **Push notifications** that nag every 2 hours until habits are logged
- **Punishment system** — 2 consecutive misses or too many weekly misses triggers a full-screen punishment gate you can't dismiss without accepting
- **App blocker** — blocks Instagram & TikTok (via iOS Screen Time / FamilyControls) until all habits are logged for the day
- **Stats screen** — 90-day GitHub-style heatmap, streak leaderboard, completion rate
- **Weekly review** — miss pattern detection, per-habit breakdown, shareable summary
- **Grace day** — 1 per habit per month, doesn't break streak

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Expo SDK 52 + Expo Router 4 |
| Styling | NativeWind v4 (Tailwind in RN) |
| Animations | React Native Reanimated 3 |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Notifications | expo-notifications |
| Haptics | expo-haptics |
| Auth storage | expo-secure-store |
| Offline cache | @react-native-async-storage/async-storage |
| App blocking | iOS FamilyControls (custom Swift native module) |

---

## Supabase Setup

Project ID: `ejgjgqeksfqkffmvkqkj`  
Region: ap-south-1  
Dashboard: https://supabase.com/dashboard/project/ejgjgqeksfqkffmvkqkj

**Schema was already applied** — tables: `habits`, `habit_logs`, `punishment_records`, `grace_days` with RLS.

Note: this Supabase project also contains a separate finance tracker app's tables (`profiles`, `accounts`, `categories`, `transactions`, `savings_goals`, `budgets`). They don't interfere with this app.

---

## Mac Setup (from scratch after cloning)

### 1. Clone the repo (if not already done)
```bash
git clone https://github.com/Mariokoubayati/accountability-tracker.git
cd accountability-tracker
```

### 2. Set up environment variables
```bash
cp .env.example .env
# .env already has the correct values — nothing to change
```

### 3. Install dependencies
```bash
npm install
```

### 4. Add app icon assets
Put these in the `assets/` folder (see `assets/README.md`):
- `icon.png` — 1024×1024
- `splash.png` — 1284×2778
- `adaptive-icon.png` — 1024×1024

Free generator: https://www.appicon.co — use a dark `#0F0F0F` background with a green `#00FF87` checkmark.

### 5. Generate the iOS project
```bash
npx expo prebuild --platform ios
cd ios && pod install && cd ..
```

### 6. Add the FamilyControls Swift module to Xcode
```bash
open ios/accountability-tracker.xcworkspace
```
In Xcode:
1. Project Navigator → right-click `accountability-tracker` folder → **Add Files to "accountability-tracker"…**
2. Navigate to `modules/FamilyControls/ios/`
3. Select all 3 files (`FamilyControlsModule.swift`, `FamilyControlsModule.m`, `FamilyActivityPickerView.swift`) → Add
4. **Signing & Capabilities** tab → `+` → search "Family Controls" → Add capability
5. Team → select your Apple ID

### 7. Apple Developer Portal
Go to https://developer.apple.com → **Certificates, IDs & Profiles** → App IDs → `com.personal.accountabilitytracker`:
- Enable **Family Controls** capability
- This is required for the Instagram/TikTok app blocker. The app works without it — blocker just won't activate.

### 8. Run on iPhone
In Xcode:
- Select your iPhone from the device dropdown (top left)
- Press ▶ (CMD+R)
- First time: on iPhone → **Settings → General → VPN & Device Management** → trust your developer certificate

---

## Alternative: EAS Cloud Build (no Mac needed)

If you're on Windows and don't have a Mac:
```bash
npm install -g eas-cli
eas login   # use your Expo account (create one at expo.dev if needed)
eas build --platform ios --profile development
```
EAS builds in the cloud and sends a QR code / install link. Requires Apple Developer account ($99/yr).

---

## First-Time App Blocker Setup

1. Open app → **Settings** tab → **App Blocking** section
2. Toggle **"Block apps until habits logged"** ON
3. Tap **"Select apps to block"** → iOS shows native Screen Time picker
4. Instagram & TikTok are pre-targeted — confirm selection → Done
5. Now they're blocked until all daily habits are logged

---

## File Structure

```
app/
  _layout.tsx              Root layout — auth gate + punishment gate
  auth/index.tsx           Email/password sign in & sign up
  (tabs)/
    _layout.tsx            Tab bar (Home · Stats · Review · Settings)
    index.tsx              Home: today's habit checklist + progress ring
    stats.tsx              90-day heatmap + streak leaderboard
    review.tsx             Weekly review + miss pattern detection
    settings.tsx           App blocker + notifications + sign out
  habit/[id].tsx           Habit detail: monthly calendar + full stats
  add-habit.tsx            Add / edit habit modal
  punishment-alert.tsx     Full-screen punishment gate (can't skip)

components/
  HabitCard.tsx            Habit row: icon, name, streak, log button
  LogButton.tsx            Animated spring check button with haptic
  StreakBadge.tsx          Current + longest streak display
  CalendarView.tsx         Monthly calendar (done/missed/grace/future)
  Heatmap.tsx              90-day GitHub-style activity heatmap
  PunishmentBanner.tsx     Inline punishment warning card
  GraceDayButton.tsx       One grace day per habit per month
  EmojiPicker.tsx          Emoji grid picker for habit icons
  WeekdaySelector.tsx      Mon-Sun toggle for habit schedule

lib/
  supabase.ts              Supabase client (secure store session)
  storage.ts               AsyncStorage helpers (offline cache)
  notifications.ts         Schedule / nag / cancel logic
  streaks.ts               Streak calculation engine
  punishments.ts           Punishment rule evaluation + write
  screenTime.ts            FamilyControls JS bridge

hooks/
  useAuth.ts               Supabase auth state
  useHabits.ts             Habit CRUD
  useLogs.ts               Log CRUD + today status
  usePunishments.ts        Unacknowledged punishment fetch

modules/
  FamilyControls/ios/
    FamilyControlsModule.swift     Native Swift module
    FamilyControlsModule.m         ObjC bridge (RCT_EXTERN_MODULE)
    FamilyActivityPickerView.swift SwiftUI picker wrapper

plugins/
  familyControls.js        Expo config plugin (entitlement + file copy)

constants/colors.ts        All colors — NEVER use inline hex values
types/index.ts             All TypeScript types
```

---

## Notification Behaviour

- **Initial reminder** fires at each habit's configured time daily
- **Nag 1** fires 2 hours after if habit is unlogged: *"Still waiting on [habit]. You said you would."*
- **Nag 2** fires 4 hours after: *"[habit] isn't going to do itself."*
- **Nag 3** fires 6 hours after (max 10 PM): *"Last chance. Log [habit] or take the L."*
- **Logging a habit** immediately cancels all its pending notifications for the day

---

## Punishment Rules

| Rule | Trigger | Screen |
|---|---|---|
| Punishment A | 2 consecutive missed days | Full-screen red gate |
| Punishment B | ≥ N misses in 7 days (N per habit) | Full-screen red gate |

The punishment screen blocks the home screen — no back button, no escape. Must tap **"I Accept This Punishment"** to proceed.

---

## Bundle ID
`com.personal.accountabilitytracker`

## Scheme
`accountability://`
