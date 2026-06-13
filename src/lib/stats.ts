/**
 * Performance stats computed from raw quiz_attempts rows.
 * All date comparisons are in the user's local calendar day.
 */

type Attempt = {
  score: number;
  total: number;
  completed_at: string;
};

/** Calendar date string YYYY-MM-DD from an ISO timestamp, local time. */
function toLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA"); // YYYY-MM-DD
}

/** Today's local date string. */
function today(): string {
  return new Date().toLocaleDateString("en-CA");
}

/** Yesterday's local date string. */
function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("en-CA");
}

/**
 * Consecutive-day streak. A streak stays alive if the person trained
 * today OR yesterday (so opening-shift vs closing-shift doesn't punish them
 * for training on the same calendar boundary).
 */
export function calcStreak(attempts: Attempt[]): number {
  if (!attempts.length) return 0;

  // Unique calendar days, most recent first
  const days = [
    ...new Set(attempts.map((a) => toLocalDate(a.completed_at))),
  ].sort((a, b) => b.localeCompare(a));

  const todayStr = today();
  const yestStr = yesterday();

  // Streak only counts if they've trained today or yesterday
  if (days[0] !== todayStr && days[0] !== yestStr) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/** Average score as a 0-100 percentage across all attempts. */
export function calcAvgPct(attempts: Attempt[]): number {
  if (!attempts.length) return 0;
  const sum = attempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0);
  return Math.round(sum / attempts.length);
}

/** Whether the person has trained on a given YYYY-MM-DD date. */
export function trainedOnDay(attempts: Attempt[], dateStr: string): boolean {
  return attempts.some((a) => toLocalDate(a.completed_at) === dateStr);
}

/**
 * Last 7 calendar days (today first → 6 days ago last) as YYYY-MM-DD strings.
 */
export function lastSevenDays(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString("en-CA");
  });
}

/** Short day label for display: "Mon", "Tue", etc. */
export function shortDay(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
  });
}
