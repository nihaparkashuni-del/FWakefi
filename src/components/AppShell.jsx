import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Wallet, User, Settings, LogOut, Sun, Moon, Bell, Plus, ShieldCheck } from "lucide-react";
import Dashboard from "./Dashboard";
import WalletScreen from "./WalletScreen";
import ProfileScreen from "./ProfileScreen";
import SettingsScreen from "./SettingsScreen";

const TABS = [
    { id: "home", icon: Zap, label: "Dashboard" },
    { id: "wallet", icon: Wallet, label: "Staking" },
    { id: "profile", icon: User, label: "History" },
    { id: "settings", icon: Settings, label: "Settings" },
];

const AppShell = ({
    streak, stakeAmount, setStakeAmount,
    alarmTime, setAlarmTime,
    onArm, isProcessing, accountId,
    totalStaked, totalRescued,
    scheduleId,
    onLogout,
}) => {
    const [tab, setTab] = useState("home");
    const [isDark, setIsDark] = useState(true);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className="h-screen flex flex-col bg-dark text-white overflow-hidden transition-colors duration-500">
            {/* ── Header ─────────────────────────────────────────── */}
            <header className="h-20 flex items-center justify-between px-8 nav-blur border-b border-white/5 relative z-50">
                <div className="flex items-center gap-10">
                    <div
                        className="flex items-center gap-2 group cursor-pointer"
                        onClick={() => setTab("home")}
                    >
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20 transition-transform group-hover:scale-110">
                            <Zap className="w-5 h-5 text-dark fill-dark" />
                        </div>
                        <span className="text-xl font-bold tracking-tighter">Wakefi</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`transition-all duration-300 relative py-2 ${tab === t.id ? "text-white" : "text-muted hover:text-white"
                                    }`}
                            >
                                {t.label}
                                {tab === t.id && (
                                    <motion.div
                                        layoutId="headerNav"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                        <span className="text-slate-400">Hedera Testnet</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold transition-all">
                            <Bell size={14} className="text-muted" />
                            <span className="text-muted">4 Notifications</span>
                        </button>
                    </div>

                    <div className="h-8 w-[1px] bg-white/5" />

                    <div className="flex items-center gap-3">
                        <button className="bg-accent text-dark px-5 py-2 rounded-full text-xs font-black hover:bg-accent-deep hover:text-white transition-all shadow-xl shadow-accent/10">
                            {accountId ? `${accountId.slice(0, 6)}...` : "Connect Wallet"}
                        </button>
                        <button
                            onClick={onLogout}
                            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-rose-500/10 transition-all text-muted hover:text-rose-500"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Main Content ─────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto relative py-8">
                <div className="max-w-6xl mx-auto px-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, y: 10, scale: 0.995 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 1.005 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {tab === "home" && (
                                <Dashboard
                                    streak={streak}
                                    stakeAmount={stakeAmount}
                                    setStakeAmount={setStakeAmount}
                                    alarmTime={alarmTime}
                                    setAlarmTime={setAlarmTime}
                                    onArm={onArm}
                                    isProcessing={isProcessing}
                                    accountId={accountId}
                                    totalStaked={totalStaked}
                                    totalRescued={totalRescued}
                                    scheduleId={scheduleId}
                                />
                            )}
                            {tab === "wallet" && <WalletScreen accountId={accountId} />}
                            {tab === "profile" && <ProfileScreen accountId={accountId} streak={streak} />}
                            {tab === "settings" && (
                                <SettingsScreen
                                    alarmTime={alarmTime}
                                    setAlarmTime={setAlarmTime}
                                    stakeAmount={stakeAmount}
                                    setStakeAmount={setStakeAmount}
                                    accountId={accountId}
                                    streak={streak}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-dark">
                <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
                <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-accent-deep/5 rounded-full blur-[100px]" />
            </div>
        </div>
    );
};

export default AppShell;
