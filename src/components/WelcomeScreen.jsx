import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, Zap, ArrowRight, UserCircle, Hexagon } from "lucide-react";

/**
 * Wakefi Welcome Screen
 * Premium login interface with Revolut-inspired aesthetics.
 */
const WelcomeScreen = ({ onLogin }) => {
    // Pre-fill from env so demos always show real Hedera balance
    const envAccountId = import.meta.env.VITE_HEDERA_ACCOUNT_ID || "";
    const [accountId, setAccountId] = useState(envAccountId);
    const [error, setError] = useState("");

    const handleStart = () => {
        if (!accountId) {
            onLogin(`guest_${Math.floor(Math.random() * 10000)}`);
            return;
        }
        if (!accountId.includes(".")) {
            setError("Invalid Hedera ID (e.g. 0.0.123)");
            return;
        }
        onLogin(accountId);
    };

    return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-accent-deep/5 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md z-10 space-y-12"
            >
                {/* Brand Identity */}
                <div className="text-center space-y-4">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-[22px] bg-accent shadow-[0_20px_40px_rgba(127,132,246,0.25)] mb-4"
                    >
                        <Zap size={40} className="text-dark fill-dark" />
                    </motion.div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-white tracking-tighter">Wakefi</h1>
                        <p className="text-muted font-medium tracking-tight">The world's first staking-as-discipline protocol.</p>
                    </div>
                </div>

                {/* Login Interface */}
                <div className="glass p-8 rounded-[24px] border-white/5 space-y-8 shadow-2xl relative">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted flex items-center gap-2">
                                <Hexagon size={12} className="text-accent" />
                                Hedera Network ID
                            </label>
                            <span className="text-[10px] font-bold text-accent/60">Mainnet v4.2</span>
                        </div>
                        <input
                            type="text"
                            placeholder="0.0.xxxxxx"
                            value={accountId}
                            onChange={(e) => {
                                setAccountId(e.target.value);
                                setError("");
                            }}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-white text-xl font-bold placeholder:text-white/10 focus:border-accent/40 focus:bg-white/[0.06] transition-all outline-none"
                        />
                        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-rose-500 font-bold px-1">{error}</motion.p>}
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleStart}
                            className="w-full py-5 bg-accent text-dark rounded-full text-lg font-black hover:bg-accent-deep hover:text-white transition-all shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {accountId ? "Connect Identity" : "Launch Protocol"}
                            <ArrowRight size={20} className="opacity-60" />
                        </button>

                        {!accountId && (
                            <p className="text-center text-[11px] text-muted font-bold animate-pulse">
                                Entering Sandbox Mode as Anonymous Guest
                            </p>
                        )}
                    </div>

                    {/* How it works Mini-cards */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                            <Shield className="w-4 h-4 text-accent mb-1" />
                            <p className="text-[10px] font-black uppercase text-white/40">Proof of Stake</p>
                            <p className="text-[10px] text-muted leading-tight font-medium">Risk your HBAR to guarantee consistency.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                            <Sparkles className="w-4 h-4 text-success mb-1" />
                            <p className="text-[10px] font-black uppercase text-white/40">Reputation</p>
                            <p className="text-[10px] text-muted leading-tight font-medium">Level up your streak and earn rewards.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="text-center space-y-1 opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                        SECURED BY HEDERA CONSENSUS SERVICE
                    </p>
                    <p className="text-[9px] font-medium text-muted uppercase">
                        EthDenver 2026 Innovation Track
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
