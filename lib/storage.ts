import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog, PunishmentRecord } from '../types';

const KEYS = {
  habits: 'cache:habits',
  logs: (date: string) => `cache:logs:${date}`,
  punishments: 'cache:punishments',
  appBlockerEnabled: 'settings:appBlockerEnabled',
};

export async function cacheHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.habits, JSON.stringify(habits));
}

export async function getCachedHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(KEYS.habits);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Habit[];
  } catch {
    return [];
  }
}

export async function cacheLogs(date: string, logs: HabitLog[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.logs(date), JSON.stringify(logs));
}

export async function getCachedLogs(date: string): Promise<HabitLog[]> {
  const raw = await AsyncStorage.getItem(KEYS.logs(date));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HabitLog[];
  } catch {
    return [];
  }
}

export async function cachePunishments(records: PunishmentRecord[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.punishments, JSON.stringify(records));
}

export async function getCachedPunishments(): Promise<PunishmentRecord[]> {
  const raw = await AsyncStorage.getItem(KEYS.punishments);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PunishmentRecord[];
  } catch {
    return [];
  }
}

export async function getAppBlockerEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.appBlockerEnabled);
  return raw === 'true';
}

export async function setAppBlockerEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.appBlockerEnabled, String(enabled));
}
