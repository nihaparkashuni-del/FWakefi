import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    RefreshCw, Zap, TrendingUp, ShieldCheck, History,
    Target, Activity, Check, Flame, ExternalLink, Clock,
    AlertTriangle, Lock, Unlock
} from "lucide-react";
import GlassCard from "./ui/GlassCard";

const MIRROR = "https://testnet.mirrornode.hedera.com/api/v1/accounts/";
const GRACE_MINUTES = 15;

// Calculate burn execution time from alarm time string
const getBurnTime = (alarmTimeStr) => {
    const [hh, mm] = alarmTimeStr.split(":").map(Number);
    const alarmDate = new Date();
    alarmDate.setHours(hh, mm, 0, 0);
    if (alarmDate.getTime() <= Date.now()) {
        alarmDate.setDate(alarmDate.getDate() + 1);
    }
    const burnDate = new Date(alarmDate.getTime() + GRACE_MINUTES * 60 * 1000);
    return { alarmDate, burnDate };
};

const formatTime12h = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
};

const Dashboard = ({
    streak, stakeAmount, setStakeAmount,
    alarmTime, setAlarmTime,
    onArm, isProcessing,
    accountId,
    totalStaked = 0,
    totalRescued = 0,
    scheduleId = null,
}) => {
    const [balance, setBalance] = useState(null);
    const [balLoading, setBalLoading] = useState(false);

    const fetchBalance = useCallback(async (id) => {
        if (!id || id.startsWith("guest_")) return;
        setBalLoading(true);
        try {
            const res = await fetch(`${MIRROR}${id.trim()}`);
            const json = await res.json();
            const hbar = (json?.balance?.balance ?? 0) / 1e8;
            setBalance(hbar.toFixed(4));
        } catch (e) {
            setBalance("—");
        } finally {
            setBalLoading(false);
        }
    }, []);

    useEffect(() => { fetchBalance(accountId); }, [accountId, fetchBalance]);

    const isGuest = accountId?.startsWith("guest_");
    const pnl = +(totalRescued - totalStaked).toFixed(4);
    const efficiency = totalStaked > 0 ? Math.round((totalRescued / totalStaked) * 100) : 0;

    const { alarmDate, burnDate } = getBurnTime(alarmTime);
    const alarmLabel = formatTime12h(alarmDate);
    const burnLabel = formatTime12h(burnDate);

    // Streak milestone
    const streakToReward = 7 - (streak % 7);
    const isStreakMilestone = streak > 0 && streak % 7 === 0;

    return (
        <div className="space-y-8 animate-content pb-12">

            {/* ── Welcome Header ─────────────────────────────────────────── */}
            <div className="flex items-end justify-between px-1">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-white tracking-tighter">
                        Welcome, <span className="text-accent italic">Discipline.</span>
                    </h2>
                    <p className="text-muted font-medium text-sm">
                        Stake HBAR. Wake up. Prove it. No middlemen — pure Hedera consensus.
                    </p>
                </div>
                {isStreakMilestone && (
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-wider"
                    >
                        🏆 {streak}-Day Streak!
                    </motion.div>
                )}
            </div>

            {/* ── Stats Row ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="premium-card space-y-2 group">
                    <div className="flex justify-between items-center text-muted">
                        <p className="text-[10px] font-black uppercase tracking-widest">Total Staked</p>
                        <ShieldCheck size={14} className="group-hover:text-accent transition-colors" />
                    </div>
                    <p className="text-3xl font-black">{totalStaked.toFixed(1)} <span className="text-accent">ℏ</span></p>
                    <div className="flex items-center gap-1 text-[10px] text-success font-bold pt-1">
                        <TrendingUp size={11} /> On-Chain Ledger
                    </div>
                </div>

                <div className="premium-card space-y-2 group">
                    <div className="flex justify-between items-center text-muted">
                        <p className="text-[10px] font-black uppercase tracking-widest">Day Streak</p>
                        <Flame size={14} className="group-hover:text-orange-500 transition-colors" />
                    </div>
                    <p className="text-3xl font-black">{streak} <span className="text-orange-500 italic text-lg">days</span></p>
                    <div className="text-[10px] text-muted font-bold pt-1">
                        {streak > 0 ? `${streakToReward} to next reward` : "Start a streak today"}
                    </div>
                </div>

                <div className="premium-card space-y-2 group">
                    <div className="flex justify-between items-center text-muted">
                        <p className="text-[10px] font-black uppercase tracking-widest">Balance</p>
                        <RefreshCw
                            size={14}
                            onClick={() => fetchBalance(accountId)}
                            className={`cursor-pointer group-hover:text-accent transition-all ${balLoading ? "animate-spin" : ""}`}
                        />
                    </div>
                    <p className="text-3xl font-black truncate">
                        {isGuest ? "—" : (balLoading ? "..." : balance || "0.00")}
                        <span className="text-accent text-xl"> ℏ</span>
                    </p>
                    <div className="text-[10px] text-muted font-bold pt-1">
                        {isGuest ? "Guest mode" : `≈ $${balance ? (parseFloat(balance) * 0.073).toFixed(2) : "0.00"} USD`}
                    </div>
                </div>

                <div className={`premium-card space-y-2 group ${pnl >= 0 ? "border-success/20 bg-success/[0.02]" : "border-rose-500/20 bg-rose-500/[0.02]"}`}>
                    <div className={`flex justify-between items-center ${pnl >= 0 ? "text-success" : "text-rose-500"}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest">Net P&L</p>
                        <TrendingUp size={14} />
                    </div>
                    <p className={`text-3xl font-black ${pnl >= 0 ? "text-success" : "text-rose-500"}`}>
                        {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}<span className="text-lg"> ℏ</span>
                    </p>
                    <div className="text-[10px] font-bold pt-1 text-muted">{efficiency}% efficiency</div>
                </div>
            </div>

            {/* ── Main Grid ─────────────────────────────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* ── Staking Protocol Panel ── */}
                <div className="lg:col-span-2 glass rounded-[20px] overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-accent" />
                            Staking Protocol
                        </h3>
                        {isGuest && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent px-2 py-1 rounded bg-accent/10">
                                Sandbox Mode
                            </span>
                        )}
                    </div>

                    <div className="p-8 space-y-6 flex-1">
                        {/* Commitment Amount */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className={`text-[10px] font-black uppercase tracking-widest transition-colors ${stakeAmount < 0.5 ? "text-rose-500" : "text-muted"}`}>
                                    Commitment Amount
                                </label>
                                <span className={`text-xs font-bold ${stakeAmount < 0.5 ? "text-rose-500" : "text-muted"}`}>
                                    {stakeAmount < 0.5 ? "⚠ Minimum 0.5ℏ" : `≈ $${(stakeAmount * 0.073).toFixed(2)} USD`}
                                </span>
                            </div>
                            <div className="relative group">
                                <input
                                    type="number"
                                    value={stakeAmount}
                                    min="0.5"
                                    step="0.1"
                                    onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
                                    className={`w-full bg-white/[0.03] border rounded-3xl p-7 text-5xl font-black tracking-tighter outline-none focus:bg-white/[0.06] transition-all tabular-nums ${stakeAmount < 0.5 ? "border-rose-500/50" : "border-white/10 focus:border-accent/40"}`}
                                />
                                <div className={`absolute right-8 top-1/2 -translate-y-1/2 text-3xl font-bold transition-colors ${stakeAmount < 0.5 ? "text-rose-500" : "text-accent"}`}>ℏ</div>
                            </div>
                        </div>

                        {/* Alarm Time + Burn Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 space-y-1 hover:bg-white/[0.05] transition-all">
                                <p className="text-[10px] font-black uppercase text-muted tracking-widest flex items-center gap-1">
                                    <Clock size={9} /> Alarm Time
                                </p>
                                <input
                                    type="time"
                                    value={alarmTime}
                                    onChange={(e) => setAlarmTime(e.target.value)}
                                    className="bg-transparent font-bold text-xl outline-none text-white w-full cursor-pointer"
                                />
                                <p className="text-[9px] text-muted/60 font-medium">{alarmLabel}</p>
                            </div>
                            <div className="p-5 rounded-3xl bg-rose-500/[0.04] border border-rose-500/10 space-y-1">
                                <p className="text-[10px] font-black uppercase text-rose-400/70 tracking-widest flex items-center gap-1">
                                    <Flame size={9} /> Auto-Burn Time
                                </p>
                                <p className="font-bold text-xl text-rose-400">{burnLabel}</p>
                                <p className="text-[9px] text-rose-500/50 font-medium">Alarm + {GRACE_MINUTES}min grace</p>
                            </div>
                        </div>

                        {/* How it works — collapsible info */}
                        <div className="p-4 rounded-2xl bg-accent/[0.03] border border-accent/10 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-accent/70 flex items-center gap-1.5">
                                <Lock size={9} /> How the Protocol Works
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                {[
                                    { step: "1", icon: "🔒", label: "Stake locks", sub: "Schedule created on Hedera" },
                                    { step: "2", icon: "⏰", label: "Alarm fires", sub: `Answer quiz in ${GRACE_MINUTES}min` },
                                    { step: "3", icon: "✅", label: "Succeed = save", sub: "Schedule deleted, funds back" },
                                ].map(({ step, icon, label, sub }) => (
                                    <div key={step} className="p-2 rounded-xl bg-black/20 space-y-1">
                                        <p className="text-lg">{icon}</p>
                                        <p className="text-[10px] font-black text-white">{label}</p>
                                        <p className="text-[8px] text-muted leading-tight">{sub}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[9px] text-muted/60 leading-relaxed pt-1">
                                Fail or disappear → Hedera consensus auto-executes the burn at {burnLabel}, even if app is offline.
                            </p>
                        </div>

                        {/* Arm Button */}
                        <button
                            onClick={onArm}
                            disabled={isProcessing || stakeAmount < 0.5}
                            className={`w-full py-6 rounded-full text-xl font-black transition-all shadow-2xl flex items-center justify-center gap-3 ${isProcessing || stakeAmount < 0.5
                                ? "bg-white/5 text-muted cursor-not-allowed"
                                : "bg-accent text-dark hover:bg-accent-deep hover:text-white shadow-accent/20 active:scale-[0.98]"
                                }`}
                        >
                            {isProcessing ? (
                                <><RefreshCw className="animate-spin" /> Creating Hedera Schedule...</>
                            ) : stakeAmount < 0.5 ? (
                                <><AlertTriangle size={22} className="text-rose-500" /> Amount Too Low</>
                            ) : (
                                <><ShieldCheck size={24} /> Arm Guardian — Stake {stakeAmount}ℏ</>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Sidebar ── */}
                <div className="glass rounded-[20px] flex flex-col">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="font-bold flex items-center gap-2 text-muted">
                            <History size={16} /> Protocol History
                        </h3>
                    </div>

                    <div className="p-6 space-y-5 flex-1">
                        {/* Schedule ID (if armed) */}
                        <AnimatePresence>
                            {scheduleId && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-2xl bg-accent/10 border border-accent/20 space-y-2"
                                >
                                    <p className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-1">
                                        <Lock size={8} /> Active Schedule
                                    </p>
                                    <p className="text-xs font-mono text-white/70 break-all leading-relaxed">{scheduleId}</p>
                                    <a
                                        href={`https://hashscan.io/testnet/schedule/${scheduleId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[9px] font-black text-accent uppercase tracking-widest hover:underline underline-offset-2"
                                    >
                                        View on HashScan <ExternalLink size={8} />
                                    </a>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Recent activity */}
                        {streak > 0 ? (
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center text-success group-hover:scale-110 transition-transform shrink-0">
                                    <Check size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">Stake Rescued</p>
                                    <p className="text-[10px] text-muted">Last active cycle</p>
                                </div>
                                <p className="text-sm font-black text-success shrink-0">+{stakeAmount}ℏ</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-28 text-center space-y-3 opacity-40">
                                <Activity className="text-muted" size={36} />
                                <p className="text-[10px] font-bold uppercase tracking-widest">No activity yet</p>
                            </div>
                        )}

                        <div className="h-px bg-white/5" />

                        {/* Cumulative summary */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Cumulative Summary</p>
                            <div className="space-y-2.5">
                                {[
                                    { label: "Total Rescued", value: `${totalRescued.toFixed(2)}ℏ`, color: "text-white" },
                                    { label: "Total Burned", value: `${Math.max(0, totalStaked - totalRescued).toFixed(2)}ℏ`, color: "text-rose-400" },
                                    { label: "Protocol Efficiency", value: `${efficiency}%`, color: efficiency >= 70 ? "text-success" : "text-orange-400" },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="flex justify-between text-xs items-center">
                                        <span className="text-muted font-medium">{label}</span>
                                        <span className={`font-black ${color}`}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        {/* Streak progress bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted">Streak Progress</p>
                                <p className="text-[10px] font-black text-orange-400">{streak}/7</p>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (streak % 7) / 7 * 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-500"
                                />
                            </div>
                            <p className="text-[9px] text-muted/60">
                                {streakToReward === 7 ? "Start your streak today!" : `${streakToReward} days until 0.5ℏ bonus reward`}
                            </p>
                        </div>
                    </div>

                    <div className="p-5 mt-auto">
                        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 text-center space-y-0.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted">Hedera Consensus Service</p>
                            <p className="text-[9px] text-success/70 font-bold">● Testnet • {accountId || "Guest"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
