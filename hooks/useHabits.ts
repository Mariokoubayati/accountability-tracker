import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { cacheHabits, getCachedHabits } from '../lib/storage';
import { Habit } from '../types';

type UseHabitsReturn = {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => Promise<Habit | null>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  reorderHabits: (ordered: Habit[]) => Promise<void>;
};

export function useHabits(userId: string | undefined): UseHabitsReturn {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    if (!userId) {
      setHabits([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true });

      if (fetchError) {
        const cached = await getCachedHabits();
        setHabits(cached);
        setError(fetchError.message);
      } else {
        const result = (data ?? []) as Habit[];
        setHabits(result);
        await cacheHabits(result);
        setError(null);
      }
    } catch {
      const cached = await getCachedHabits();
      setHabits(cached);
      setError('Network error — using cached data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const createHabit = useCallback(
    async (habit: Omit<Habit, 'id' | 'user_id' | 'created_at'>): Promise<Habit | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('habits')
        .insert({ ...habit, user_id: userId })
        .select()
        .single();
      if (error) return null;
      await fetchHabits();
      return data as Habit;
    },
    [userId, fetchHabits]
  );

  const updateHabit = useCallback(
    async (id: string, updates: Partial<Habit>): Promise<void> => {
      await supabase.from('habits').update(updates).eq('id', id);
      await fetchHabits();
    },
    [fetchHabits]
  );

  const deleteHabit = useCallback(
    async (id: string): Promise<void> => {
      await supabase.from('habits').delete().eq('id', id);
      await fetchHabits();
    },
    [fetchHabits]
  );

  const reorderHabits = useCallback(
    async (ordered: Habit[]): Promise<void> => {
      setHabits(ordered);
      for (let i = 0; i < ordered.length; i++) {
        await supabase.from('habits').update({ order_index: i }).eq('id', ordered[i].id);
      }
    },
    []
  );

  return {
    habits,
    loading,
    error,
    refresh: fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
  };
}
