import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { cacheLogs, getCachedLogs } from '../lib/storage';
import { HabitLog } from '../types';
import { getTodayKey } from '../lib/streaks';

type UseLogsReturn = {
  logs: HabitLog[];
  todayLogs: HabitLog[];
  loading: boolean;
  logHabit: (habitId: string, status: HabitLog['status'], note?: string) => Promise<HabitLog | null>;
  getLogsForHabit: (habitId: string) => HabitLog[];
  getTodayStatusForHabit: (habitId: string) => HabitLog['status'] | null;
  refresh: () => Promise<void>;
};

export function useLogs(userId: string | undefined, habitIds: string[]): UseLogsReturn {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!userId || habitIds.length === 0) {
      setLogs([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .in('habit_id', habitIds)
        .order('date', { ascending: false });

      if (error) {
        const todayKey = getTodayKey();
        const cached = await getCachedLogs(todayKey);
        setLogs(cached);
      } else {
        const result = (data ?? []) as HabitLog[];
        setLogs(result);
        const todayKey = getTodayKey();
        const todayResult = result.filter((l) => l.date === todayKey);
        await cacheLogs(todayKey, todayResult);
      }
    } catch {
      const todayKey = getTodayKey();
      const cached = await getCachedLogs(todayKey);
      setLogs(cached);
    } finally {
      setLoading(false);
    }
  }, [userId, habitIds.join(',')]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logHabit = useCallback(
    async (
      habitId: string,
      status: HabitLog['status'],
      note?: string
    ): Promise<HabitLog | null> => {
      if (!userId) return null;
      const todayKey = getTodayKey();
      const { data, error } = await supabase
        .from('habit_logs')
        .upsert(
          {
            habit_id: habitId,
            user_id: userId,
            date: todayKey,
            status,
            note: note ?? null,
            logged_at: new Date().toISOString(),
          },
          { onConflict: 'habit_id,date' }
        )
        .select()
        .single();

      if (error) return null;
      await fetchLogs();
      return data as HabitLog;
    },
    [userId, fetchLogs]
  );

  const getLogsForHabit = useCallback(
    (habitId: string): HabitLog[] => logs.filter((l) => l.habit_id === habitId),
    [logs]
  );

  const getTodayStatusForHabit = useCallback(
    (habitId: string): HabitLog['status'] | null => {
      const todayKey = getTodayKey();
      const log = logs.find((l) => l.habit_id === habitId && l.date === todayKey);
      return log?.status ?? null;
    },
    [logs]
  );

  const todayLogs = logs.filter((l) => l.date === getTodayKey());

  return {
    logs,
    todayLogs,
    loading,
    logHabit,
    getLogsForHabit,
    getTodayStatusForHabit,
    refresh: fetchLogs,
  };
}
