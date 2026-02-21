import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppShell from "./src/components/AppShell";
import RingingScreen from "./src/components/RingingScreen";
import QuizModal from "./src/components/QuizModal";
import BurnScreen from "./src/components/BurnScreen";
import WelcomeScreen from "./src/components/WelcomeScreen";
import { armAlarm, disarmAlarm } from "./src/hederaService";
import { getStreak, incrementStreak, resetStreak } from "./src/supabaseClient";

// ── Splash Component ────────────────────────────────────────────────────────
const SplashPortal = ({ onComplete }) => {
    const [isMorphed, setIsMorphed] = useState(false);

    const handleStart = () => {
        setIsMorphed(true);
        setTimeout(onComplete, 1200);
    };

    return (
        <div
            className="fixed inset-0 z-[1000] bg-dark flex items-center justify-center cursor-pointer overflow-hidden"
            onClick={handleStart}
        >
            <div className={`relative transition-all duration-800 ${isMorphed ? 'animate-morph' : ''}`}>
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <img
                            src="/alarm.png"
                            alt="Wakefi"
                            className="w-64 h-64 object-contain brightness-110 drop-shadow-[0_0_60px_rgba(127,132,246,0.5)]"
                        />
                    </motion.div>
                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-black tracking-[0.6em] uppercase text-accent animate-pulse">
                            Initialize Protocol
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Index = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    // If env has a real account ID, always prefer it over a stale guest session
    const envAccountId = import.meta.env.VITE_HEDERA_ACCOUNT_ID || "";
    const [accountId, setAccountId] = useState(() => {
        const stored = localStorage.getItem("wakefi_accountId") || "";
        // Auto-upgrade guest sessions to the real env account
        if (stored.startsWith("guest_") && envAccountId) {
            localStorage.setItem("wakefi_accountId", envAccountId);
            return envAccountId;
        }
        return stored || envAccountId;
    });

    const [screen, setScreen] = useState(accountId ? "app" : "welcome");
    const [streak, setStreak] = useState(0);
    const [stakeAmount, setStakeAmount] = useState(2.5);
    const [alarmTime, setAlarmTime] = useState("07:00");
    const [scheduleId, setScheduleId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // ── Financial Stats Persistence ────────────────────────────────────────
    const [totalStaked, setTotalStaked] = useState(() =>
        parseFloat(localStorage.getItem("wakefi_totalStaked") ?? "0")
    );
    const [totalRescued, setTotalRescued] = useState(() =>
        parseFloat(localStorage.getItem("wakefi_totalRescued") ?? "0")
    );

    const addStaked = (amt) => setTotalStaked(prev => {
        const n = +(prev + amt).toFixed(4);
        localStorage.setItem("wakefi_totalStaked", n);
        return n;
    });

    const addRescued = (amt) => setTotalRescued(prev => {
        const n = +(prev + amt).toFixed(4);
        localStorage.setItem("wakefi_totalRescued", n);
        return n;
    });

    const handleLogin = (id) => {
        localStorage.setItem("wakefi_accountId", id);
        setAccountId(id);
        setScreen("app");
    };

    const handleLogout = () => {
        localStorage.removeItem("wakefi_accountId");
        setAccountId("");
        setScreen("welcome");
    };

    useEffect(() => {
        if (!accountId) return;
        getStreak(accountId).then(setStreak);
    }, [accountId]);

    useEffect(() => {
        if (screen !== "app") return;
        const iv = setInterval(() => {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, "0");
            const mm = String(now.getMinutes()).padStart(2, "0");
            if (`${hh}:${mm}` === alarmTime && now.getSeconds() < 10) {
                setScreen("ringing");
            }
        }, 1000);
        return () => clearInterval(iv);
    }, [screen, alarmTime]);

    const handleArm = async () => {
        if (stakeAmount < 0.5) {
            alert("Minimum commitment is 0.5 ℏ");
            return;
        }
        setIsProcessing(true);
        try {
            const alarmId = `${accountId || "guest"}-${Date.now()}`;
            const id = await armAlarm(stakeAmount, alarmTime, alarmId);
            setScheduleId(id);
            addStaked(stakeAmount);
            setScreen("ringing");
        } catch (err) {
            console.error("Protocol arming failed:", err);
            alert("Protocol Error: Check Hedera credentials.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleQuizSuccess = async () => {
        setIsProcessing(true);
        try {
            if (scheduleId) {
                await disarmAlarm(scheduleId);
                setScheduleId(null);
            }
            addRescued(stakeAmount);
            const next = await incrementStreak(accountId);
            setStreak(next);
            setScreen("app");
        } catch (err) {
            console.error("Protocol disarm failed:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleQuizFail = async () => {
        setIsProcessing(true);
        try {
            await resetStreak(accountId);
            setStreak(0);
            setScreen("burn");
        } catch (err) {
            console.error("Streak reset failed:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBurnBack = () => setScreen("app");

    if (!isInitialized) {
        return <SplashPortal onComplete={() => setIsInitialized(true)} />;
    }

    return (
        <div className="h-screen bg-dark overflow-hidden animate-content">
            <AnimatePresence mode="wait">
                {screen === "welcome" && (
                    <motion.div
                        key="welcome"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="h-full"
                    >
                        <WelcomeScreen onLogin={handleLogin} />
                    </motion.div>
                )}

                {screen === "app" && (
                    <motion.div
                        key="app"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="h-full"
                    >
                        <AppShell
                            streak={streak}
                            stakeAmount={stakeAmount}
                            setStakeAmount={setStakeAmount}
                            alarmTime={alarmTime}
                            setAlarmTime={setAlarmTime}
                            onArm={handleArm}
                            isProcessing={isProcessing}
                            accountId={accountId}
                            totalStaked={totalStaked}
                            totalRescued={totalRescued}
                            scheduleId={scheduleId}
                            onLogout={handleLogout}
                        />
                    </motion.div>
                )}

                {screen === "ringing" && (
                    <motion.div
                        key="ringing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full"
                    >
                        <RingingScreen
                            stakeAmount={stakeAmount}
                            onDisarm={() => setScreen("quiz")}
                            onBack={() => setScreen("app")}
                        />
                    </motion.div>
                )}

                {screen === "quiz" && (
                    <motion.div
                        key="quiz"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="h-full"
                    >
                        <QuizModal
                            onSuccess={handleQuizSuccess}
                            onFail={handleQuizFail}
                            onBack={() => setScreen("app")}
                            isProcessing={isProcessing}
                            stakeAmount={stakeAmount}
                            totalStaked={totalStaked}
                            totalRescued={totalRescued}
                            streak={streak}
                        />
                    </motion.div>
                )}

                {screen === "burn" && (
                    <motion.div
                        key="burn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full overflow-y-auto"
                    >
                        <BurnScreen
                            stakeAmount={stakeAmount}
                            onBack={handleBurnBack}
                            totalStaked={totalStaked}
                            totalRescued={totalRescued}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Index;
