import { supabase } from './supabase';
import { Habit, HabitLog, PunishmentRecord } from '../types';
import { calculateStreaks } from './streaks';

function subtractDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function evaluatePunishments(
  habit: Habit,
  logs: HabitLog[],
  userId: string
): Promise<PunishmentRecord[]> {
  const triggered: PunishmentRecord[] = [];
  const today = new Date();
  const yesterday = subtractDays(today, 1);
  const twoDaysAgo = subtractDays(today, 2);

  const logMap = new Map<string, HabitLog['status']>();
  for (const log of logs) {
    logMap.set(log.date, log.status);
  }

  // Punishment A: 2 consecutive misses
  const yday = toDateKey(yesterday);
  const tda = toDateKey(twoDaysAgo);
  if (logMap.get(yday) === 'missed' && logMap.get(tda) === 'missed' && habit.punishment_a) {
    const { data: existing } = await supabase
      .from('punishment_records')
      .select('id')
      .eq('habit_id', habit.id)
      .eq('type', 'consecutive')
      .gte('triggered_at', tda)
      .limit(1);

    if (!existing || existing.length === 0) {
      const { data, error } = await supabase
        .from('punishment_records')
        .insert({
          habit_id: habit.id,
          user_id: userId,
          type: 'consecutive',
          punishment_text: habit.punishment_a,
          acknowledged: false,
        })
        .select()
        .single();

      if (!error && data) {
        triggered.push(data as PunishmentRecord);
      }
    }
  }

  // Punishment B: weekly miss frequency
  if (habit.punishment_b_text) {
    const streakData = calculateStreaks(logs, today);
    if (streakData.weeklyMissCount >= habit.punishment_b_threshold) {
      const sevenDaysAgo = toDateKey(subtractDays(today, 7));
      const { data: existing } = await supabase
        .from('punishment_records')
        .select('id')
        .eq('habit_id', habit.id)
        .eq('type', 'frequency')
        .gte('triggered_at', sevenDaysAgo)
        .limit(1);

      if (!existing || existing.length === 0) {
        const { data, error } = await supabase
          .from('punishment_records')
          .insert({
            habit_id: habit.id,
            user_id: userId,
            type: 'frequency',
            punishment_text: habit.punishment_b_text,
            acknowledged: false,
          })
          .select()
          .single();

        if (!error && data) {
          triggered.push(data as PunishmentRecord);
        }
      }
    }
  }

  return triggered;
}

export async function acknowledgePunishment(punishmentId: string): Promise<void> {
  await supabase
    .from('punishment_records')
    .update({ acknowledged: true })
    .eq('id', punishmentId);
}

export async function fetchUnacknowledgedPunishments(userId: string): Promise<PunishmentRecord[]> {
  const { data, error } = await supabase
    .from('punishment_records')
    .select('*')
    .eq('user_id', userId)
    .eq('acknowledged', false)
    .order('triggered_at', { ascending: true });

  if (error) return [];
  return (data ?? []) as PunishmentRecord[];
}
