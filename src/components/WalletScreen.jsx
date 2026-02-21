import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Wallet, RefreshCw, Copy, ExternalLink, ArrowUpRight, ArrowDownLeft, ShieldCheck, History } from "lucide-react";
import ShootingStars from "./ShootingStars";
import GlassCard from "./ui/GlassCard";
import PremiumButton from "./ui/PremiumButton";

const MIRROR = "https://testnet.mirrornode.hedera.com/api/v1/accounts/";

const WalletScreen = ({ accountId }) => {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [txns, setTxns] = useState([]);

    const fetchData = useCallback(async () => {
        if (!accountId || accountId.startsWith("guest_")) return;
        setLoading(true);
        try {
            const [accRes, txRes] = await Promise.all([
                fetch(`${MIRROR}${accountId}`),
                fetch(`${MIRROR}${accountId}/transactions?limit=5&order=desc`),
            ]);
            const accJson = await accRes.json();
            const txJson = await txRes.json();
            setBalance((accJson?.balance?.balance ?? 0) / 1e8);
            setTxns(txJson?.transactions ?? []);
        } catch (e) {
            console.error("Wallet fetch error:", e);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const isGuest = accountId?.startsWith("guest_");

    const copy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 pb-20">
            <ShootingStars />

            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white leading-tight underline decoration-accent/30 underline-offset-8">Wealth</h2>
                    <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Digital Asset Vault</p>
                </div>
                {!isGuest && (
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-accent hover:bg-accent/10 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                )}
            </div>

            {/* Balance Hero */}
            <GlassCard className="p-8 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group">
                <div className="space-y-2 relative z-10">
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500">Available Capital</p>
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-6xl font-black text-white tabular-nums tracking-tighter">
                            {isGuest ? "0.00" : (loading ? "..." : balance !== null ? balance.toFixed(2) : "0.00")}
                        </span>
                        <span className="text-2xl font-bold text-accent">ℏ</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500">
                        ≈ ${isGuest ? "0.00" : (balance !== null ? (balance * 0.073).toFixed(2) : "0.00")} USD
                    </p>
                </div>

                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${isGuest ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                    ● {isGuest ? "Sandbox Mode" : "Hedera Testnet Secured"}
                </div>

                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors" />
            </GlassCard>

            {/* Account Details */}
            <GlassCard className="p-6 space-y-6" hover={false}>
                <div className="flex items-center gap-2 px-1">
                    <ShieldCheck size={16} className="text-accent" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Identity Details</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10 group">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Public Identifier</p>
                            <p className="text-sm font-bold text-white font-mono tracking-tight">{isGuest ? "Guest_User" : accountId}</p>
                        </div>
                        {!isGuest && (
                            <button
                                onClick={() => copy(accountId)}
                                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                            >
                                {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Network Protocol</p>
                            <p className="text-sm font-bold text-white italic">{isGuest ? "Local Sandbox" : "Hedera Hashgraph"}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <ExternalLink size={16} className="text-indigo-400" />
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Transactions */}
            {!isGuest && (
                <GlassCard className="p-6 space-y-6" hover={false}>
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <History size={16} className="text-accent" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Stream</h3>
                        </div>
                        <button className="text-[10px] font-black text-accent uppercase tracking-tighter hover:underline">View All</button>
                    </div>

                    <div className="space-y-3">
                        {txns.length === 0 ? (
                            <div className="py-10 text-center space-y-2">
                                <p className="text-sm text-slate-600 font-medium italic">No ledger entries detected.</p>
                            </div>
                        ) : (
                            txns.map((tx, i) => {
                                const ts = tx.consensus_timestamp
                                    ? new Date(parseFloat(tx.consensus_timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : "—";
                                const isSuccess = tx.result === "SUCCESS";
                                return (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSuccess ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {isSuccess ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white capitalize">{tx.name?.replace(/_/g, " ").toLowerCase() || "Transfer"}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">{ts}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-black ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {isSuccess ? "Success" : "Failed"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

export default WalletScreen;
