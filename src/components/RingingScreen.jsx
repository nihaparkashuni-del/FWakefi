import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Bell, ShieldCheck, AlertTriangle, ArrowLeft, LayoutDashboard } from "lucide-react";

/**
 * Wakefi Ringing Screen
 * High-intensity alarm state triggered at the commitment time.
 * Features: looping alarm sound, back-to-dashboard option.
 */
const RingingScreen = ({ stakeAmount, onDisarm, onBack }) => {
    const audioCtxRef = useRef(null);
    const intervalRef = useRef(null);

    // ── Synthesized Alarm Sound ───────────────────────────────
    const playAlarmBurst = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            audioCtxRef.current = ctx;

            const playBeep = (startTime, freq, duration) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = "square";
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.18, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            const now = ctx.currentTime;
            // Classic alarm: alternating high-low beeps
            playBeep(now + 0.0, 860, 0.12);
            playBeep(now + 0.15, 680, 0.12);
            playBeep(now + 0.3, 860, 0.12);
            playBeep(now + 0.45, 680, 0.12);
            playBeep(now + 0.6, 860, 0.12);
            playBeep(now + 0.75, 680, 0.12);
        } catch (e) {
            // AudioContext may be blocked until user interaction
        }
    };

    useEffect(() => {
        // Play immediately, then every 2.5s
        playAlarmBurst();
        intervalRef.current = setInterval(playAlarmBurst, 2500);
        return () => {
            clearInterval(intervalRef.current);
            audioCtxRef.current?.close();
        };
    }, []);

    const stopSound = () => {
        clearInterval(intervalRef.current);
        audioCtxRef.current?.close();
    };

    return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* High-Intensity Pulsing Security Glow */}
            <motion.div
                animate={{
                    opacity: [0.1, 0.5, 0.1],
                    scale: [1, 1.4, 1]
                }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0 bg-accent/25 blur-[150px] rounded-full"
            />
            {/* Secondary danger pulse */}
            <motion.div
                animate={{ opacity: [0.05, 0.2, 0.05] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 bg-rose-500/5 blur-[200px] rounded-full"
            />

            {/* Back to Dashboard (top-left) */}
            <button
                onClick={() => { stopSound(); onBack && onBack(); }}
                className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-muted hover:text-white hover:bg-white/10 transition-all"
            >
                <LayoutDashboard size={14} />
                Dashboard
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-lg z-10 space-y-12 text-center"
            >
                {/* Security Beacon */}
                <div className="space-y-6">
                    <motion.div
                        animate={{
                            rotate: [-18, 18, -18],
                            y: [0, -12, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 0.25 }}
                        className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-accent text-dark shadow-[0_30px_80px_rgba(127,132,246,0.5)]"
                    >
                        <Bell size={52} className="fill-dark" />
                    </motion.div>

                    <div className="space-y-2">
                        <motion.h1
                            animate={{ opacity: [1, 0.7, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className="text-7xl font-black text-white tracking-tighter uppercase italic"
                        >
                            Wake Up!
                        </motion.h1>
                        <p className="text-accent font-black uppercase tracking-[0.4em] text-xs">Security Protocol Active</p>
                    </div>
                </div>

                {/* Risk Management Card */}
                <div className="glass p-10 rounded-[32px] border-white/5 shadow-2xl space-y-8">
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Hedera Assets at Risk</p>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-7xl font-black text-white tabular-nums tracking-tighter">{stakeAmount}</span>
                            <span className="text-3xl font-bold text-accent">ℏ</span>
                        </div>
                        <p className="text-sm text-muted font-medium italic">Complete the challenge to rescue your stake.</p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <button
                            onClick={() => { stopSound(); onDisarm(); }}
                            className="w-full py-6 bg-accent text-dark rounded-full text-xl font-black shadow-2xl shadow-accent/30 hover:bg-accent-deep hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <ShieldCheck size={26} />
                            Launch Verification
                        </button>

                        <div className="flex items-center justify-center gap-2 text-rose-500 font-bold">
                            <motion.div
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                            >
                                <AlertTriangle size={14} />
                            </motion.div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Protocol failure will execute burn</span>
                        </div>
                    </div>
                </div>

                <div className="opacity-40">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.5em]">
                        DISCIPLINE IS FREEDOM
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RingingScreen;
