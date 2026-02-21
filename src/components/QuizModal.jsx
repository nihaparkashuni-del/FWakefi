import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    RefreshCw,
    CheckCircle2,
    XCircle,
    ChevronRight,
    ShieldAlert,
    ArrowRight,
    ExternalLink,
    LayoutDashboard,
    Trophy,
    TrendingUp,
    TrendingDown,
    Coins,
} from "lucide-react";

/**
 * Wakefi Quiz Modal — Premium Hackathon Build
 * – Article truncated to ~7 lines with "Read full article" link
 * – Question + options shown immediately below
 * – P&L summary on result (earned / lost / total left)
 * – Streak 7-day reward celebration
 * – Back to Dashboard escape hatch
 * – Scrollable full-page layout
 */
const TIMER_SECONDS = 30;

const QuizModal = ({ onSuccess, onFail, onBack, isProcessing, stakeAmount = 0, totalRescued = 0, totalStaked = 0, streak = 0 }) => {
    const [article, setArticle] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [result, setResult] = useState(null); // "correct" | "wrong"
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const [showStreakReward, setShowStreakReward] = useState(false);
    const timerRef = useRef(null);

    // P&L derived values
    const earned = result === "correct" ? stakeAmount : 0;
    const lost = result === "wrong" ? stakeAmount : 0;
    const totalLeft = result === "correct"
        ? totalRescued + stakeAmount
        : Math.max(0, totalRescued - 0); // when correct, stake is rescued

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=EN");
                const json = await res.json();
                // Rotate through top 10 articles
                const idx = Math.floor(Math.random() * 10);
                const news = json.Data[idx];
                const url = news.url || news.guid || "#";

                setArticle({
                    title: news.title,
                    // ~7 lines ≈ 420 chars at normal width
                    snippet: news.body.slice(0, 420),
                    source: news.source_info?.name || "CryptoCompare",
                    url,
                });

                // Build a meaningful question from title keywords
                const titles = json.Data.slice(0, 10).map(a => a.source_info?.name || "Unknown");
                const correct = news.source_info?.name || titles[0];
                const distractors = [...new Set(titles.filter(t => t !== correct))].slice(0, 3);
                while (distractors.length < 3) distractors.push(["CoinDesk", "Decrypt", "The Block"].find(x => !distractors.includes(x)) || "BlockWire");

                const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
                const correctIndex = options.indexOf(correct);

                setQuiz({
                    question: `Based on this intelligence report, which outlet published this article?`,
                    options,
                    correctIndex,
                });

                timerRef.current = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current);
                            setResult("wrong");
                            setTimeout(onFail, 2500);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } catch (e) {
                console.error("Quiz fetch failed", e);
                // Fallback static quiz
                setArticle({ title: "Protocol Integrity Verification", snippet: "Welcome to Wakefi's proof-of-knowledge system. Answer the question to rescue your committed stake.", source: "Wakefi Protocol", url: "#" });
                setQuiz({ question: "What does 'DeFi' stand for?", options: ["Decentralized Finance", "Digital Finance", "Distributed Funding", "Dynamic Fees"], correctIndex: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
        return () => clearInterval(timerRef.current);
    }, [onFail]);

    const handleSubmit = () => {
        if (selected === null || result !== null) return;
        clearInterval(timerRef.current);
        const isCorrect = selected === quiz.correctIndex;
        setResult(isCorrect ? "correct" : "wrong");

        if (isCorrect) {
            // Check 7-day streak reward
            const newStreak = streak + 1;
            if (newStreak % 7 === 0) setShowStreakReward(true);
            setTimeout(onSuccess, showStreakReward ? 4000 : 2000);
        } else {
            setTimeout(onFail, 2500);
        }
    };

    const timerPct = (timeLeft / TIMER_SECONDS) * 100;
    const timerColor = timeLeft > 15 ? "#7F84F6" : timeLeft > 7 ? "#f59e0b" : "#f43f5e";

    return (
        <div className="fixed inset-0 z-[100] bg-dark/98 backdrop-blur-2xl overflow-y-auto">
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/5 rounded-full blur-[120px]" />
                {result === "wrong" && <div className="absolute inset-0 bg-rose-500/5 blur-[200px]" />}
                {result === "correct" && <div className="absolute inset-0 bg-emerald-500/5 blur-[200px]" />}
            </div>

            <div className="min-h-screen py-8 px-4 flex flex-col items-center justify-start">
                {/* Header */}
                <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-muted hover:text-white hover:bg-white/10 transition-all"
                    >
                        <LayoutDashboard size={14} />
                        Dashboard
                    </button>
                    {/* Timer ring */}
                    <div className="flex items-center gap-3">
                        <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                            <circle
                                cx="24" cy="24" r="20" fill="none"
                                stroke={timerColor}
                                strokeWidth="4"
                                strokeDasharray={`${2 * Math.PI * 20}`}
                                strokeDashoffset={`${2 * Math.PI * 20 * (1 - timerPct / 100)}`}
                                strokeLinecap="round"
                                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
                            />
                        </svg>
                        <span className="text-2xl font-black tabular-nums" style={{ color: timerColor }}>{timeLeft}s</span>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl space-y-5"
                >
                    {/* Title card */}
                    <div className="glass rounded-[28px] p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                                <Brain size={20} className="text-dark" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white tracking-tight">Knowledge Proof</h2>
                                <p className="text-[9px] text-muted font-bold uppercase tracking-[0.25em]">Protocol Verification v2.0 · Stake at risk: {stakeAmount}ℏ</p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="glass rounded-[28px] p-16 flex flex-col items-center gap-5">
                            <RefreshCw size={36} className="text-accent animate-spin opacity-50" />
                            <p className="text-xs font-black text-muted uppercase tracking-[0.3em]">Decoding Consensus Stream...</p>
                        </div>
                    ) : (
                        <>
                            {/* Intelligence Report */}
                            <div className="glass rounded-[28px] p-6 border border-white/5 space-y-4">
                                <div className="flex items-center gap-2 text-[9px] font-black text-accent uppercase tracking-widest">
                                    <ShieldAlert size={11} />
                                    Intelligence Source: {article.source}
                                </div>
                                <h3 className="text-base font-bold text-white leading-snug">{article.title}</h3>
                                {/* Exactly 7 lines of text via line-clamp-7 */}
                                <p className="text-sm text-muted leading-relaxed font-medium line-clamp-7">
                                    {article.snippet}
                                </p>
                                {article.url && article.url !== "#" && (
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[10px] font-black text-accent uppercase tracking-widest hover:underline underline-offset-4"
                                    >
                                        Read full article <ExternalLink size={10} />
                                    </a>
                                )}
                            </div>

                            {/* Quiz */}
                            <div className="glass rounded-[28px] p-6 border border-white/5 space-y-5">
                                <p className="text-sm font-bold text-white/90 leading-snug">{quiz.question}</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {quiz.options.map((opt, i) => {
                                        const isSelected = selected === i;
                                        const isCorrect = i === quiz.correctIndex;
                                        const isWrong = result === "wrong" && isSelected;
                                        const showCorrect = result === "correct" && isCorrect;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => !result && setSelected(i)}
                                                className={`p-4 rounded-2xl border text-sm font-bold text-left transition-all flex justify-between items-center
                                                    ${showCorrect ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400" :
                                                        isWrong ? "bg-rose-500/15 border-rose-500/50 text-rose-400" :
                                                            isSelected ? "bg-accent/15 border-accent/40 text-white" :
                                                                "bg-white/[0.02] border-white/5 text-muted hover:bg-white/[0.05] hover:border-white/10"
                                                    }`}
                                            >
                                                <span>{opt}</span>
                                                {isSelected && !result && <ChevronRight size={16} className="opacity-40 shrink-0" />}
                                                {showCorrect && <CheckCircle2 size={16} className="shrink-0" />}
                                                {isWrong && <XCircle size={16} className="shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={selected === null || result !== null || isProcessing}
                                    className={`w-full py-5 rounded-full text-base font-black transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98]
                                        ${result === "correct" ? "bg-emerald-500 text-white" :
                                            result === "wrong" ? "bg-rose-500 text-white" :
                                                selected !== null ? "bg-accent text-dark shadow-accent/20" :
                                                    "bg-white/5 text-muted cursor-not-allowed"
                                        }`}
                                >
                                    {result === "correct" ? <><CheckCircle2 size={20} /> Proof Confirmed</> :
                                        result === "wrong" ? <><XCircle size={20} /> Verification Failed</> :
                                            <><ArrowRight size={18} /> Submit Proof</>}
                                </button>
                            </div>

                            {/* P&L Result Card */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`rounded-[28px] p-6 border space-y-4 ${result === "correct"
                                            ? "bg-emerald-500/10 border-emerald-500/20"
                                            : "bg-rose-500/10 border-rose-500/20"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {result === "correct"
                                                ? <TrendingUp size={24} className="text-emerald-400" />
                                                : <TrendingDown size={24} className="text-rose-400" />
                                            }
                                            <div>
                                                <p className="font-black text-white text-base">
                                                    {result === "correct" ? "🎉 Stake Rescued!" : "💸 Stake Burned"}
                                                </p>
                                                <p className="text-xs text-muted font-medium">
                                                    {result === "correct"
                                                        ? "You demonstrated knowledge. Your commitment is returned."
                                                        : "Protocol failure. Your staked HBAR has been liquidated."}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-3 rounded-2xl bg-black/30 text-center space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted">
                                                    {result === "correct" ? "Earned" : "Lost"}
                                                </p>
                                                <p className={`text-xl font-black tabular-nums ${result === "correct" ? "text-emerald-400" : "text-rose-400"}`}>
                                                    {result === "correct" ? "+" : "-"}{stakeAmount}ℏ
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-2xl bg-black/30 text-center space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted">Total Rescued</p>
                                                <p className="text-xl font-black tabular-nums text-accent">
                                                    {result === "correct" ? (totalRescued + stakeAmount).toFixed(2) : totalRescued.toFixed(2)}ℏ
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-2xl bg-black/30 text-center space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted">Total Staked</p>
                                                <p className="text-xl font-black tabular-nums text-white">
                                                    {totalStaked.toFixed(2)}ℏ
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 7-Day Streak Reward */}
                            <AnimatePresence>
                                {showStreakReward && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="rounded-[28px] p-8 border border-yellow-500/30 bg-yellow-500/10 text-center space-y-4"
                                    >
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                                            transition={{ duration: 0.5, repeat: 4 }}
                                            className="text-6xl"
                                        >
                                            🏆
                                        </motion.div>
                                        <div>
                                            <p className="text-yellow-400 font-black text-xl tracking-tight">7-Day Streak Reward!</p>
                                            <p className="text-muted text-sm font-medium mt-1">You maintained discipline for a full week.</p>
                                            <div className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                                                <Trophy size={16} className="text-yellow-400" />
                                                <span className="text-yellow-400 font-black text-sm">+0.5ℏ Mini Reward Unlocked</span>
                                                <Coins size={16} className="text-yellow-400" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}

                    {/* Bottom spacing */}
                    <div className="h-8" />
                </motion.div>
            </div>
        </div>
    );
};

export default QuizModal;
