import {
    Client,
    PrivateKey,
    AccountId,
    TransferTransaction,
    Hbar,
    ScheduleCreateTransaction,
    ScheduleDeleteTransaction,
    ScheduleId,
    Timestamp,
} from "@hashgraph/sdk";

// ── Burn address: Hedera treasury sink (0.0.98) ──────────────────────────────
// 0.0.98 is the Hedera Reward Account — a real, valid sink on both testnet and mainnet.
const BURN_ADDRESS = "0.0.98";

// ── Grace period: 15 minutes after the alarm fires ──────────────────────────
const GRACE_PERIOD_MS = 15 * 60 * 1000;

/**
 * Returns an initialized Hedera testnet client using ECDSA credentials from env.
 */
const getClient = () => {
    const accountId = import.meta.env.VITE_HEDERA_ACCOUNT_ID;
    const privateKeyStr = import.meta.env.VITE_HEDERA_PRIVATE_KEY;

    if (!accountId || !privateKeyStr) {
        throw new Error(
            "Missing VITE_HEDERA_ACCOUNT_ID or VITE_HEDERA_PRIVATE_KEY in environment variables."
        );
    }

    const client = Client.forTestnet();
    const keyStr = privateKeyStr.replace(/^0x/, "");
    client.setOperator(AccountId.fromString(accountId), PrivateKey.fromStringECDSA(keyStr));
    return { client, accountId, privateKeyStr: keyStr };
};

/**
 * Arms the alarm by creating a Hedera ScheduleCreateTransaction with setWaitForExpiry(true).
 *
 * Architecture:
 * ┌─ User arms alarm at T (alarmTime) ──────────────────────────────┐
 * │  executionTime = T + 15 min (grace period)                      │
 * │  ScheduleCreateTransaction:                                     │
 * │    • Scheduled tx: transfer `amount` HBAR → burn address        │
 * │    • setWaitForExpiry(true) → Hedera auto-executes at expiry    │
 * │    • setAdminKey(operator) → app can delete on quiz success     │
 * │    • memo = "WakeFi alarm:<alarmId>"                            │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * On QUIZ SUCCESS → disarmAlarm() deletes the schedule → funds safe.
 * On QUIZ FAIL / DISAPPEAR → Hedera consensus auto-executes the burn
 *   at executionTime, regardless of app state, device, or internet.
 *
 * @param {number} amount       - Amount of HBAR to stake (stake ≥ 0.5).
 * @param {string} alarmTimeStr - "HH:MM" string from the alarm picker.
 * @param {string} alarmId      - Unique alarm identifier for memo tracking.
 * @returns {Promise<string>}   - The scheduleId string for later deletion.
 */
export const armAlarm = async (amount, alarmTimeStr = null, alarmId = null) => {
    if (amount < 0.5) throw new Error("Minimum stake is 0.5 HBAR.");

    const { client, accountId, privateKeyStr } = getClient();
    const privateKey = PrivateKey.fromStringECDSA(privateKeyStr);

    // ── Calculate execution time ─────────────────────────────────────────────
    let executionTime;
    if (alarmTimeStr) {
        // Parse the user's selected wake-up time (today or tomorrow)
        const [hh, mm] = alarmTimeStr.split(":").map(Number);
        const alarmDate = new Date();
        alarmDate.setHours(hh, mm, 0, 0);
        // If the alarm is in the past (e.g. it's 8am and they set 7am), schedule for tomorrow
        if (alarmDate.getTime() <= Date.now()) {
            alarmDate.setDate(alarmDate.getDate() + 1);
        }
        executionTime = new Date(alarmDate.getTime() + GRACE_PERIOD_MS);
    } else {
        // Demo fallback: 2 minutes from now (for hackathon testing without waiting overnight)
        executionTime = new Date(Date.now() + 2 * 60 * 1000);
    }

    const id = alarmId || `alarm-${Date.now()}`;
    console.log(`[WakeFi] Arming alarm | ID: ${id} | Amount: ${amount}ℏ`);
    console.log(`[WakeFi] Burn scheduled for: ${executionTime.toISOString()}`);
    console.log(`[WakeFi] User: ${accountId} → Burn: ${BURN_ADDRESS}`);

    // ── Inner transfer transaction (the burn) ────────────────────────────────
    const transferTx = new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(accountId), new Hbar(-amount))
        .addHbarTransfer(AccountId.fromString(BURN_ADDRESS), new Hbar(amount));

    // ── Wrap in a ScheduleCreateTransaction ─────────────────────────────────
    //   setWaitForExpiry(true) = Hedera consensus executes the burn automatically
    //   at executionTime, even if the app is offline, closed, or the device is off.
    //   setAdminKey = allows the app to delete the schedule on quiz success.
    const scheduleTx = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transferTx)
        .setScheduleMemo(`WakeFi alarm:${id}`)
        .setAdminKey(privateKey)
        .setExpirationTime(Timestamp.fromDate(executionTime))
        .setWaitForExpiry(true)
        .freezeWith(client)
        .sign(privateKey);

    console.log("[WakeFi] Submitting ScheduleCreateTransaction...");
    const response = await scheduleTx.execute(client);
    const receipt = await response.getReceipt(client);

    const scheduleId = receipt.scheduleId.toString();
    console.log(`[WakeFi] ✅ Schedule created: ${scheduleId}`);
    console.log(`[WakeFi] Countdown active — burn executes at ${executionTime.toISOString()} unless disarmed.`);

    client.close();
    return scheduleId;
};

/**
 * Disarms the alarm by deleting the scheduled transaction using the admin key.
 * This is called only on quiz SUCCESS — it cancels the burn and rescues the stake.
 *
 * @param {string} scheduleIdString - The scheduleId returned by armAlarm.
 * @returns {Promise<void>}
 */
export const disarmAlarm = async (scheduleIdString) => {
    console.log(`[WakeFi] Disarming schedule: ${scheduleIdString}`);

    const { client, privateKeyStr } = getClient();
    const privateKey = PrivateKey.fromStringECDSA(privateKeyStr);

    // The admin key (set during armAlarm) authorizes the delete
    const deleteTx = await new ScheduleDeleteTransaction()
        .setScheduleId(ScheduleId.fromString(scheduleIdString))
        .freezeWith(client)
        .sign(privateKey);

    const response = await deleteTx.execute(client);
    const receipt = await response.getReceipt(client);

    console.log(`[WakeFi] ✅ Schedule deleted. Status: ${receipt.status.toString()}`);
    console.log("[WakeFi] Stake rescued — funds are safe!");

    client.close();
};
