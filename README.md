# ⏰ WakeFi — Stake to Wake

> **The world's first crypto alarm clock with real financial consequences.**  
> Miss your wake-up? Your HBAR burns on-chain — automatically — even if your phone is off.

🔗 **Live Demo:** [f-wakefi-atfh.vercel.app](https://f-wakefi-atfh.vercel.app)  
🏗 **Built at:** ETHDenver 2026 · Hedera Innovation Track

---

## 🧠 The Problem

Alarm snoozing is a trillion-dollar productivity failure. Every self-help app offers streaks, badges, and motivational quotes. None of them put anything real on the line.

**WakeFi changes the game with skin in the game.**

---

## ⚡ How It Works

```
User sets alarm + stakes HBAR
         │
         ▼
  ScheduleCreateTransaction
  (setWaitForExpiry = true)
         │
    ┌────┴────┐
    │         │
User wakes   User sleeps
   up           in
    │             │
   Quiz        ⏳ 15-min
  passed?      grace period
    │         expires
    │             │
    ▼             ▼
ScheduleDelete  Hedera consensus
(funds safe)   auto-executes burn
```

1. **Arm the Alarm** — User stakes 0.5–10 HBAR. A `ScheduleCreateTransaction` is created on Hedera with `setWaitForExpiry(true)`, set to execute at `alarmTime + 15 minutes`.

2. **The Alarm Rings** — At wake-up time, the app plays an alarm sound and launches the **Intelligence Verification Quiz** — a real crypto news question fetched live from the CryptoCompare API.

3. **Answer to Disarm** — Correct answer triggers `ScheduleDeleteTransaction`, cancelling the burn. Funds are safe.

4. **Fail or Disappear** — Hedera Consensus Service automatically executes the scheduled transfer to the burn address at `alarmTime + 15min`. No server needed. No cron job. No escape.

---

## 🔒 Why This Is Trustless

WakeFi has **no traditional backend**, no cron jobs, no off-chain executors, and no smart contracts.

The entire enforcement mechanism lives natively on the **Hedera ledger**:

- `ScheduleCreateTransaction` + `setWaitForExpiry(true)` = Hedera consensus triggers the burn at a precise timestamp
- The app uses `setAdminKey` so only the user's key can delete the schedule (on quiz success)
- If the app is closed, the phone is off, or the internet is down — **the burn still executes on time**

---

## 🏆 7-Day Streak Reward

Answer correctly 7 days in a row? Earn a **+0.5ℏ bonus reward** and a golden trophy celebration. The protocol rewards consistent discipline.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite + Tailwind CSS v4 + Framer Motion |
| **Blockchain** | Hedera Hashgraph — `@hashgraph/sdk` |
| **Scheduling** | Hedera Native Scheduled Transactions (`ScheduleCreateTransaction`) |
| **Database** | Supabase (streak persistence) |
| **News API** | CryptoCompare News API (live quiz generation) |
| **Deployment** | Vercel |

---

## 🎯 Bounty Targets

### 🥇 Hedera — Best Use of Hedera Native Features
WakeFi uses **Hedera Scheduled Transactions** (`ScheduleCreateTransaction` + `setWaitForExpiry`) as a trustless, serverless enforcement layer — no smart contracts required. The burn executes on-chain at a precise timestamp regardless of app state.

### 🥈 Hedera — Best DeFi Application
First-ever **Proof-of-Discipline** staking protocol. Users lock HBAR with a time-bound release condition. Real financial accountability, enforced by consensus.

### 🥉 Most Innovative Use of AI
The quiz is powered by live crypto news (CryptoCompare API) with questions generated dynamically per session — preventing memorization and ensuring real engagement every morning.

---

## 📁 Project Structure

```
/
├── heth.jsx                  # Main app entry — screen router, state
├── src/
│   ├── hederaService.js      # armAlarm() + disarmAlarm() — all on-chain logic
│   ├── supabaseClient.js     # Streak tracking (getStreak, increment, reset)
│   └── components/
│       ├── Dashboard.jsx     # Main UI — stake, alarm time, burn time, P&L
│       ├── RingingScreen.jsx # Alarm state — Web Audio API beeps
│       ├── QuizModal.jsx     # Live news quiz — 15min grace period
│       ├── BurnScreen.jsx    # Liquidation screen — P&L breakdown
│       ├── WelcomeScreen.jsx # Login with Hedera Account ID
│       ├── AppShell.jsx      # Navigation shell
│       ├── WalletScreen.jsx  # On-chain balance + transaction history
│       └── ProfileScreen.jsx # Streak history + rewards
└── public/
    └── alarm.png             # Alarm clock icon
```

---

## 🚀 Local Development

```bash
# Clone
git clone https://github.com/nihaparkashuni-del/FWakefi.git
cd FWakefi

# Install
npm install

# Configure (create .env)
VITE_HEDERA_ACCOUNT_ID=0.0.XXXXXX
VITE_HEDERA_PRIVATE_KEY=your_ecdsa_private_key_hex
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Run
npm run dev
```

---

## 🔗 On-Chain Verification

Every alarm creates a real Hedera Scheduled Transaction visible on HashScan:

```
https://hashscan.io/testnet/schedule/<scheduleId>
```

The schedule shows:
- The burn transfer (user → burn address)
- The exact execution timestamp (alarmTime + 15 min)
- Status: **ACTIVE** → **EXECUTED** (burned) or **DELETED** (rescued)

---

## 👩‍💻 Team

Built with ❤️ at ETHDenver 2026 by **Niha Parkash**

---

*WakeFi — Because the blockchain doesn't snooze.*
