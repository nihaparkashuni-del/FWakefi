import React from "react";
import { motion } from "framer-motion";
import {
    AlertCircle, ArrowLeft, Flame, TrendingDown, TrendingUp, Coins, LayoutDashboard
} from "lucide-react";

/**
 * Wakefi Burn Screen
 * Premium liquidation state triggered on protocol failure.
 * Shows full P&L breakdown: lost, total rescued so far, total staked.
 */
const BurnScreen = ({ stakeAmount, onBack, totalRescued = 0, totalStaked = 0 }) => {
    const netPerformance = totalRescued - totalStaked;
    const efficiencyPct = totalStaked > 0 ? ((totalRescued / totalStaked) * 100).toFixed(0) : 0;

    return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Danger Glow */}
            <motion.div
                animate={{ opacity: [0.05, 0.2, 0.05], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute inset-0 bg-rose-500/10 blur-[150px] rounded-full scale-110"
            />

            {/* Back to Dashboard */}
            <button
                onClick={onBack}
                className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-muted hover:text-white hover:bg-white/10 transition-all"
            >
                <LayoutDashboard size={14} />
                Dashboard
            </button>

            <div className="w-full max-w-lg z-10 space-y-8 overflow-y-auto py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-8 text-center"
                >
                    {/* Liquidation Beacon */}
                    <div className="space-y-6">
                        <motion.div
                            animate={{ scale: [1, 1.08, 1], rotate: [-4, 4, -4] }}
                            transition={{ repeat: Infinity, duration: 0.35 }}
                            className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-rose-500 text-white shadow-[0_20px_60px_rgba(244,63,94,0.35)]"
                        >
                            <Flame size={48} className="fill-white" />
                        </motion.div>

                        <div className="space-y-2">
                            <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic">Overslept</h1>
                            <p className="text-rose-500 font-black uppercase tracking-[0.4em] text-xs">Liquidation Executed</p>
                        </div>
                    </div>

                    {/* Audit Card */}
                    <div className="glass p-8 rounded-[32px] border-rose-500/10 bg-rose-500/[0.02] shadow-2xl space-y-6 text-left">
                        {/* Loss amount */}
                        <div className="space-y-2 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Stake Burned</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-6xl font-black text-rose-400 tabular-nums tracking-tighter">-{stakeAmount}</span>
                                <span className="text-2xl font-bold text-rose-500">ℏ</span>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 w-full" />

                        {/* P&L Breakdown */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-2xl bg-black/40 text-center space-y-1">
                                <TrendingDown size={14} className="mx-auto text-rose-400" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted">Lost Today</p>
                                <p className="text-lg font-black tabular-nums text-rose-400">-{stakeAmount}ℏ</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-black/40 text-center space-y-1">
                                <TrendingUp size={14} className="mx-auto text-accent" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted">Total Rescued</p>
                                <p className="text-lg font-black tabular-nums text-accent">{totalRescued.toFixed(2)}ℏ</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-black/40 text-center space-y-1">
                                <Coins size={14} className="mx-auto text-white" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted">Total Staked</p>
                                <p className="text-lg font-black tabular-nums text-white">{totalStaked.toFixed(2)}ℏ</p>
                            </div>
                        </div>

                        {/* Net Performance */}
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${netPerformance >= 0 ? "bg-emerald-500/15" : "bg-rose-500/15"}`}>
                                {netPerformance >= 0
                                    ? <TrendingUp size={18} className="text-emerald-400" />
                                    : <TrendingDown size={18} className="text-rose-400" />
                                }
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted">Net Protocol Performance</p>
                                <p className={`text-sm font-black tabular-nums ${netPerformance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                    {netPerformance >= 0 ? "+" : ""}{netPerformance.toFixed(2)}ℏ · {efficiencyPct}% Efficiency
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 text-left p-5 rounded-2xl bg-black/40 border border-white/5">
                            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-xs text-muted leading-relaxed font-medium">
                                The Wakefi protocol enforces absolute consistency. Failure to provide proof-of-knowledge resulted in a smart contract burn event. Streak has been reset.
                            </p>
                        </div>
                    </div>

                    {/* Return Button */}
                    <button
                        onClick={onBack}
                        className="w-full py-5 bg-white/[0.03] border border-white/10 rounded-full text-base font-black text-white hover:bg-white/[0.07] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <ArrowLeft size={18} />
                        Return to Dashboard
                    </button>

                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">
                        CYCLE TERMINATED · RE-STAKE TO CONTINUE
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default BurnScreen;
