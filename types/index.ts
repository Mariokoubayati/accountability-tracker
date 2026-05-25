export type Habit = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  target_days: 'daily' | string;
  reminder_time: string;
  punishment_a: string;
  punishment_b_threshold: number;
  punishment_b_text: string;
  order_index: number;
  created_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  status: 'done' | 'missed' | 'grace';
  note?: string;
  logged_at?: string;
};

export type PunishmentRecord = {
  id: string;
  habit_id: string;
  user_id: string;
  type: 'consecutive' | 'frequency';
  triggered_at: string;
  punishment_text: string;
  acknowledged: boolean;
};

export type GraceDay = {
  id: string;
  habit_id: string;
  user_id: string;
  month: number;
  year: number;
  used: boolean;
};

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  weeklyMissCount: number;
  weeklyMissPattern: number[];
};

export type DayStatus = 'done' | 'missed' | 'grace' | 'future' | 'skipped' | 'none';

export type HabitWithStreak = Habit & {
  todayStatus: HabitLog['status'] | null;
  streak: StreakData;
};
