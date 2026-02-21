# ⏰ WakeFi — Stake to Wake

> **The world's first crypto alarm clock with real financial consequences.**  
> Miss your wake-up? Your HBAR burns on-chain — automatically — even if your phone is off.

🔗 **Live Demo:** [f-wakefi-atfh.vercel.app](https://f-wakefi-atfh.vercel.app)  
📁 **Repo:** [github.com/nihaparkashuni-del/FWakefi](https://github.com/nihaparkashuni-del/FWakefi)  
🏗 **Built at:** ETHDenver 2026 · Hedera Innovation Track

---

## 📋 Table of Contents

- [POC — Proof of Concept](#-poc--proof-of-concept)
- [PRD — Product Requirements](#-prd--product-requirements-document)
- [TRD — Technical Requirements](#-trd--technical-requirements-document)
- [Bounty Targets](#-bounty-targets)
- [Local Development](#-local-development)

---

## 🧪 POC — Proof of Concept

### What We Built

WakeFi is a fully functional, deployed proof-of-concept demonstrating that **behavioral accountability can be enforced trustlessly on a public ledger** — without smart contracts, without a backend server, and without any trusted third party.

### What We Proved

| Claim | Proof |
|---|---|
| A burn can be scheduled to auto-execute on Hedera | `ScheduleCreateTransaction` with `setWaitForExpiry(true)` confirmed live on testnet |
| The burn fires even when the app is offline | Hedera Consensus Service executed schedule `0.0.8000084` in our test — no app involvement |
| The user can cancel the burn with a correct answer | `ScheduleDeleteTransaction` with admin key confirmed working |
| Financial stats persist across sessions | `localStorage` + Supabase streak tracking — verified live |
| The protocol is zero-backend | No server, no cron job, no off-chain executor anywhere in the stack |

### Demo Flow

```
[Splash] → Initialize Protocol
     ↓
[Dashboard] → Set alarm time (07:00) + stake amount (2.5ℏ)
     ↓
[Arm] → ScheduleCreateTransaction created on Hedera testnet
        (burn executes at 07:15 if not cancelled)
     ↓
[Ringing] → Alarm fires, synthesized audio alert
     ↓
[Quiz] → Live crypto news question — 15-minute grace window
     ↓
   ✅ Correct → ScheduleDeleteTransaction → Funds safe, streak +1
   ❌ Wrong / No Answer → Hedera auto-executes burn at 07:15
```

### Testnet Verification

Every alarm creates a verifiable on-chain record:
```
https://hashscan.io/testnet/schedule/<scheduleId>
```

---

## 📄 PRD — Product Requirements Document

### Problem Statement

Behavioral accountability apps fail because they have no real consequences. Badge systems and streaks are psychologically weak. WakeFi introduces **credible commitment** — a concept from behavioral economics — to morning routines.

### Target Users

| Persona | Use Case |
|---|---|
| **Crypto-native productivity seekers** | Want skin-in-the-game discipline tools |
| **Builders and founders** | Early wake-ups to compete globally |
| **Web3 students** | Use financial pressure to study consistently |

### User Stories

- **As a user**, I want to stake HBAR as a commitment to wake up, so that I have a real financial incentive (not just a badge).
- **As a user**, I want the burn to happen automatically even if I turn off my phone, so I can't cheat by closing the app.
- **As a user**, I want to answer a real crypto news quiz to prove I'm awake and mentally engaged — not just dimly pressing snooze.
- **As a user**, I want to see my full P&L (earned, rescued, burned) so I can track my performance over time.
- **As a user**, I want a streak system that rewards 7 consecutive days of success with a bonus.
- **As a user**, I want to see my balance and stake live on the dashboard — no fake numbers.

### Feature Requirements

| Priority | Feature | Status |
|---|---|---|
| P0 | Stake HBAR and arm alarm | ✅ Done |
| P0 | Auto-burn via Hedera scheduled tx | ✅ Done |
| P0 | Quiz-to-disarm with live crypto news | ✅ Done |
| P0 | P&L summary on result | ✅ Done |
| P1 | 7-day streak reward (+0.5ℏ bonus) | ✅ Done |
| P1 | Real wallet balance from Hedera mirror node | ✅ Done |
| P1 | HashScan schedule deep link | ✅ Done |
| P1 | Alarm sound (Web Audio API) | ✅ Done |
| P2 | Multi-alarm support | 🔜 v2 |
| P2 | Social streak leaderboard | 🔜 v2 |
| P2 | HashPack wallet connect | 🔜 v2 |

### Success Metrics

- Schedule creation success rate ≥ 99%
- Quiz answer accuracy (user flows completing) ≥ 70%
- Zero server-side failures (no server exists)

---

## 🔧 TRD — Technical Requirements Document

### Architecture Overview

```
┌────────────────────────────────────────────────────┐
│                   Frontend (React)                 │
│  Dashboard → Arm → Ringing → Quiz → Result         │
└─────────────────────┬──────────────────────────────┘
                      │
         ┌────────────┴───────────────┐
         │                           │
  @hashgraph/sdk              Supabase (REST)
  Hedera Testnet              Streak tracking
         │
  ┌──────┴──────────────────────┐
  │   ScheduleCreateTransaction │  ← armAlarm()
  │   setWaitForExpiry(true)    │
  │   setAdminKey(userKey)      │
  │   executionTime = T + 15min │
  └─────────────┬───────────────┘
                │
         ┌──────┴───────┐
    Quiz Passed?   Quiz Failed / No Answer
         │                   │
  ScheduleDelete      Hedera Consensus
  (admin key)         auto-executes burn
  → Funds safe        at executionTime
```

### Core Protocol: `hederaService.js`

#### `armAlarm(amount, alarmTimeStr, alarmId)`

```js
const scheduleTx = await new ScheduleCreateTransaction()
  .setScheduledTransaction(transferTx)       // HBAR → burn address
  .setScheduleMemo(`WakeFi alarm:${alarmId}`)
  .setAdminKey(privateKey)                   // for deletion on success
  .setExpirationTime(Timestamp.fromDate(burnTime)) // alarmTime + 15 min
  .setWaitForExpiry(true)                    // ← auto-executes at expiry
  .freezeWith(client)
  .sign(privateKey);
```

#### `disarmAlarm(scheduleIdString)`

```js
const deleteTx = await new ScheduleDeleteTransaction()
  .setScheduleId(ScheduleId.fromString(scheduleId))
  .freezeWith(client)
  .sign(privateKey);  // admin key required
```

### Execution Timeline

| Time | Event |
|---|---|
| `T` | User arms alarm, Hedera schedule created |
| `T + 0` | `ScheduleCreateTransaction` confirmed on ledger |
| `T_alarm` | App transitions to RingingScreen, alarm sound plays |
| `T_alarm + 0–15min` | Quiz window — user has full 15 minutes |
| `T_alarm + 15min` | **Hedera auto-executes burn** if schedule not deleted |
| `T_alarm + 15min` | OR: `ScheduleDeleteTransaction` fired on quiz success |

### Key Technical Constraints

| Constraint | Handling |
|---|---|
| ECDSA key required for Hedera testnet | `PrivateKey.fromStringECDSA()` |
| Tailwind v4 cannot `@apply` component classes | Inlined all `.glass` properties into `.premium-card` |
| Large bundle size (`@hashgraph/sdk` is ~3MB) | Acceptable for hackathon; v2 will use dynamic import |
| VITE env vars must be prefixed `VITE_` | All env vars correctly prefixed |

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | 18 |
| Build Tool | Vite | 7 |
| Styling | Tailwind CSS | v4 |
| Animations | Framer Motion | 11 |
| Blockchain SDK | `@hashgraph/sdk` | 2.80 |
| Streak DB | Supabase (PostgreSQL) | v2 |
| News API | CryptoCompare News API | v2 |
| Deployment | Vercel | — |

### Environment Variables

```env
VITE_HEDERA_ACCOUNT_ID=0.0.XXXXXX
VITE_HEDERA_PRIVATE_KEY=your_ecdsa_private_key_hex
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Security Notes

- Private key is ECDSA hex, stored in `.env` (gitignored)
- Supabase anon key is read-only for streak table
- No user funds are ever custodied by the app — all on Hedera ledger
- `setAdminKey` ensures only the same key that armed can disarm

---

## 🎯 Bounty Targets

### 🥇 Hedera — Best Use of Hedera Native Features
First-ever use of `ScheduleCreateTransaction` + `setWaitForExpiry(true)` as a **trustless enforcement layer** — no smart contracts, no backend. The Hedera ledger itself is the accountability engine.

### 🥈 Hedera — Best DeFi Application
**Proof-of-Discipline** staking protocol. Users lock HBAR with a time-bound, knowledge-gated release condition. First DeFi primitive for behavioral productivity.

### 🥉 Most Innovative Use of AI / External APIs
Live crypto quiz generated from **CryptoCompare News API** — different article every morning, source-matching question, prevents cheating by memorization.

---

## 🚀 Local Development

```bash
git clone https://github.com/nihaparkashuni-del/FWakefi.git
cd FWakefi
npm install
# Create .env with keys above
npm run dev
```

---

## 👩‍💻 Team

Built with ❤️ at ETHDenver 2026 by **Niha Parkash**

---

*WakeFi — Because the blockchain doesn't snooze.*
