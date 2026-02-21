import React, { useEffect, useState } from "react";
import { User, Flame, Trophy, Calendar, Shield, BadgeCheck, Zap, Award } from "lucide-react";
import ShootingStars from "./ShootingStars";
import { supabase } from "../supabaseClient";
import GlassCard from "./ui/GlassCard";

const ProfileScreen = ({ accountId, streak }) => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!accountId) return;
        supabase
            .from("user_streaks")
            .select("*")
            .eq("account_id", accountId)
            .single()
            .then(({ data }) => setProfile(data));
    }, [accountId]);

    const lastWin = profile?.last_win_at
        ? new Date(profile.last_win_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Never";

    // Avatar: initials from account ID
    const initials = accountId ? accountId.replace(/\D/g, "").slice(-2) : "??";

    return (
        <div className="space-y-8 pb-20">
            <ShootingStars />

            <div className="px-2">
                <h2 className="text-2xl font-black text-white leading-tight underline decoration-accent/30 underline-offset-8">Identity</h2>
                <p className="text-slate-500 font-medium text-xs uppercase tracking-widest mt-1">Personnel Profile</p>
            </div>

            {/* Profile Hero */}
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center text-3xl font-black text-white shadow-[0_0_40px_rgba(245,158,11,0.3)] relative z-10 border-2 border-white/20">
                        {initials}
                    </div>
                    <div className="absolute inset-[-8px] rounded-full bg-accent/20 blur-xl animate-pulse" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white tracking-tight">Personnel Log</h3>
                    <p className="text-xs font-mono text-accent bg-accent/10 px-3 py-1 rounded-full mt-2 border border-accent/20">
                        {accountId || "GUEST_PROTOCOL"}
                    </p>
                </div>
            </div>

            {/* Core Stats Grid */}
            <GlassCard className="p-1 grid grid-cols-3 divide-x divide-white/5" hover={false}>
                <div className="p-4 flex flex-col items-center justify-center space-y-1">
                    <div className="flex items-center gap-1.5 text-orange-500">
                        <Flame size={16} />
                        <span className="text-xl font-black">{streak}</span>
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Streak</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center space-y-1">
                    <div className="flex items-center gap-1.5 text-accent">
                        <Trophy size={16} />
                        <span className="text-xl font-black">{profile?.streak ?? streak}</span>
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Best Record</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-400">
                        <Calendar size={16} />
                        <span className="text-sm font-black whitespace-nowrap">{lastWin}</span>
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Efficiency Log</span>
                </div>
            </GlassCard>

            {/* System Details */}
            <GlassCard className="p-6 space-y-4" hover={false}>
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                    <Shield size={16} className="text-accent" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Integration</h4>
                </div>
                <div className="space-y-3">
                    <DetailRow label="Network Node" value="Hedera Testnet" />
                    <DetailRow label="Security Clearance" value="Verified Level 1" />
                    <DetailRow label="Protocol Version" value="WakeFi v1.0.42" />
                </div>
            </GlassCard>

            {/* Achievements */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Award size={16} className="text-accent" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Merit Badges</h4>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <BadgeCard
                        icon={<Zap className="text-amber-400" />}
                        label="First Wake"
                        condition="Cycle 1 Completed"
                        unlocked={streak >= 1}
                    />
                    <BadgeCard
                        icon={<Flame className="text-orange-500" />}
                        label="Heat Wave"
                        condition="3-Day Streak"
                        unlocked={streak >= 3}
                    />
                    <BadgeCard
                        icon={<BadgeCheck className="text-accent" />}
                        label="Elite Resident"
                        condition="7-Day Streak"
                        unlocked={streak >= 7}
                    />
                    <BadgeCard
                        icon={<Trophy className="text-yellow-500" />}
                        label="Grand Master"
                        condition="30-Day Legend"
                        unlocked={streak >= 30}
                    />
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ label, value }) => (
    <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-bold text-white italic">{value}</span>
    </div>
);

const BadgeCard = ({ icon, label, condition, unlocked }) => (
    <GlassCard className={`p-4 space-y-3 relative overflow-hidden group ${!unlocked && 'opacity-30 grayscale'}`} hover={unlocked}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${unlocked ? 'bg-white/10' : 'bg-white/5'}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-white tracking-tight">{label}</p>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mt-0.5">{condition}</p>
        </div>
        {unlocked && (
            <div className="absolute top-2 right-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            </div>
        )}
    </GlassCard>
);

export default ProfileScreen;
