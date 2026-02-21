import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);

// ─── Streak helpers ───────────────────────────────────────────────────────────

/**
 * Fetch the current streak for a given Hedera account ID.
 * Returns 0 if the account hasn't been seen before.
 */
export const getStreak = async (accountId) => {
    // For PostgREST, quenching 406 by ensuring string IDs are treated as literals
    const { data, error } = await supabase
        .from("user_streaks")
        .select("streak")
        .eq("account_id", accountId);

    console.log(`Supabase streak fetch for ${accountId}:`, { data, error });

    if (error) {
        console.error("Supabase getStreak error:", error);
    }
    return data?.[0]?.streak ?? 0;
};

/**
 * Increment the streak for an account (called on quiz win).
 * Uses upsert so the first win also creates the record.
 */
export const incrementStreak = async (accountId) => {
    // First read current streak then write streak+1
    const current = await getStreak(accountId);
    const next = current + 1;

    const { error } = await supabase.from("user_streaks").upsert(
        { account_id: accountId, streak: next, last_win_at: new Date().toISOString() },
        { onConflict: "account_id" }
    );

    if (error) console.error("Supabase incrementStreak error:", error);
    return next;
};

/**
 * Reset the streak to 0 for an account (called on quiz fail / burn).
 */
export const resetStreak = async (accountId) => {
    const { error } = await supabase.from("user_streaks").upsert(
        { account_id: accountId, streak: 0 },
        { onConflict: "account_id" }
    );
    if (error) console.error("Supabase resetStreak error:", error);
    return 0;
};
