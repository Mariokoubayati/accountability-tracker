import { HabitLog, StreakData } from '../types';

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function subtractDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

export function calculateStreaks(logs: HabitLog[], today: Date = new Date()): StreakData {
  const logMap = new Map<string, HabitLog['status']>();
  for (const log of logs) {
    logMap.set(log.date, log.status);
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let totalCompletions = 0;
  let weeklyMissCount = 0;
  const weeklyMissPattern: number[] = new Array(7).fill(0);

  const todayKey = toDateKey(today);
  const sevenDaysAgo = subtractDays(today, 7);

  for (const log of logs) {
    if (log.status === 'done') totalCompletions++;
    const logDate = new Date(log.date);
    if (logDate >= sevenDaysAgo && logDate <= today) {
      if (log.status === 'missed') {
        weeklyMissCount++;
        weeklyMissPattern[logDate.getDay()]++;
      }
    }
  }

  let checking = new Date(today);
  const todayStatus = logMap.get(todayKey);
  if (todayStatus === 'done' || todayStatus === 'grace') {
    currentStreak = 1;
    checking = subtractDays(today, 1);
  } else if (todayStatus === 'missed') {
    currentStreak = 0;
    checking = subtractDays(today, 1);
  } else {
    checking = subtractDays(today, 1);
  }

  for (let i = 0; i < 365; i++) {
    const key = toDateKey(checking);
    const status = logMap.get(key);
    if (status === 'done' || status === 'grace') {
      if (i === 0 && todayStatus !== 'done' && todayStatus !== 'grace') {
        currentStreak = 1;
      } else if (i > 0 || todayStatus === 'done' || todayStatus === 'grace') {
        currentStreak++;
      }
    } else {
      break;
    }
    checking = subtractDays(checking, 1);
  }

  const allDates = Array.from(logMap.keys()).sort();
  for (const dateKey of allDates) {
    const status = logMap.get(dateKey);
    if (status === 'done' || status === 'grace') {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    weeklyMissCount,
    weeklyMissPattern,
  };
}

export function isTargetDay(habit: { target_days: string }, date: Date = new Date()): boolean {
  if (habit.target_days === 'daily') return true;
  const dayNumbers = habit.target_days.split(',').map(Number);
  return dayNumbers.includes(date.getDay());
}

export function getTodayKey(): string {
  return toDateKey(new Date());
}

export function formatDate(date: Date): string {
  return toDateKey(date);
}
