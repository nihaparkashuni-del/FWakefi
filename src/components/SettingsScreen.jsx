import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Shield, User, Globe, AlertTriangle, Check, Trash2, Zap } from "lucide-react";
import { resetStreak } from "../supabaseClient";
import GlassCard from "./ui/GlassCard";
import PremiumButton from "./ui/PremiumButton";

const SettingsScreen = ({
    alarmTime, setAlarmTime,
    stakeAmount, setStakeAmount,
    accountId, streak,
    onStreakReset,
}) => {
    const [clearing, setClearing] = useState(false);
    const [cleared, setCleared] = useState(false);

    const handleClearStreak = async () => {
        if (!window.confirm("Reset your streak to 0? This cannot be undone.")) return;
        setClearing(true);
        await resetStreak(accountId);
        onStreakReset(0);
        setClearing(false);
        setCleared(true);
        setTimeout(() => setCleared(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="px-2">
                <h2 className="text-2xl font-black text-white leading-tight underline decoration-accent/30 underline-offset-8">Settings</h2>
                <p className="text-slate-500 font-medium mt-2">Personalize your protocol experience.</p>
            </div>

            {/* Alarm Protocol Section */}
            <GlassCard className="space-y-6" hover={false}>
                <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                    <Clock size={16} className="text-accent" />
                    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Alarm Configuration</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold text-white">Wake Time</p>
                                <p className="text-[10px] text-slate-500 font-medium">Scheduled resonance frequency</p>
                            </div>
                            <input
                                type="time"
                                value={alarmTime}
                                onChange={(e) => setAlarmTime(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-bold outline-none focus:border-accent/50 transition-all"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold text-white">Stake Amount</p>
                                <p className="text-[10px] text-slate-500 font-medium">HBAR to be burned on failure</p>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={stakeAmount}
                                    onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0.1)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-bold outline-none focus:border-accent/50 transition-all w-24 text-right pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">ℏ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Identity & Network */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="space-y-4" hover={false}>
                    <div className="flex items-center gap-2 pb-2">
                        <User size={16} className="text-blue-400" />
                        <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Identity</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-500">ACCOUNT ID</span>
                            <span className="text-[11px] font-mono text-blue-400 font-bold">
                                {accountId?.startsWith("guest_") ? "GUEST SESSION" : accountId}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-500">STREAK</span>
                            <span className="text-[11px] text-white font-black flex items-center gap-1">
                                {streak} DAYS <Zap size={10} className="text-orange-500 fill-orange-500" />
                            </span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="space-y-4" hover={false}>
                    <div className="flex items-center gap-2 pb-2">
                        <Globe size={16} className="text-purple-400" />
                        <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Infrastructure</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-500">BLOCKCHAIN</span>
                            <span className="text-[11px] text-purple-400 font-bold uppercase tracking-wider">Hedera Testnet</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-500">DATA CLOUD</span>
                            <span className="text-[11px] text-purple-400 font-bold uppercase tracking-wider">Supabase</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Danger Zone */}
            <GlassCard className="border-red-500/20 bg-red-500/[0.02] space-y-6" hover={false}>
                <div className="flex items-center gap-2 pb-4 border-b border-red-500/10">
                    <AlertTriangle size={16} className="text-red-500" />
                    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-red-500/70">Danger Zone</h3>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <p className="text-sm font-bold text-white">Reset Protocol Streak</p>
                        <p className="text-[10px] text-slate-500 font-medium">Irreversible database reset of your progress.</p>
                    </div>
                    <PremiumButton
                        variant="danger"
                        onClick={handleClearStreak}
                        loading={clearing}
                        className="w-full md:w-auto px-8 py-2 text-xs"
                    >
                        {cleared ? <Check size={14} /> : <Trash2 size={14} />}
                        {cleared ? "Streak Wiped" : clearing ? "Wiping..." : "Reset Streak"}
                    </PremiumButton>
                </div>
            </GlassCard>

            <footer className="py-12 text-center space-y-2">
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">WakeFi Premium Protocol v2.4</p>
                <div className="flex items-center justify-center gap-4 opacity-20 hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                </div>
            </footer>
        </div>
    );
};

export default SettingsScreen;
