import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useHabits } from '../../hooks/useHabits';
import { useLogs } from '../../hooks/useLogs';
import { usePunishments } from '../../hooks/usePunishments';
import { HabitCard } from '../../components/HabitCard';
import { PunishmentBanner } from '../../components/PunishmentBanner';
import { Colors } from '../../constants/colors';
import { calculateStreaks, isTargetDay } from '../../lib/streaks';
import { evaluatePunishments } from '../../lib/punishments';
import { scheduleAllHabitReminders, cancelHabitNotifications } from '../../lib/notifications';
import { getAppBlockerEnabled } from '../../lib/storage';
import { blockSelectedApps } from '../../lib/screenTime';
import { supabase } from '../../lib/supabase';
import { HabitLog } from '../../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTodayHeader(): string {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { habits, loading: habitsLoading, refresh: refreshHabits } = useHabits(user?.id);
  const {
    loading: logsLoading,
    logHabit,
    getTodayStatusForHabit,
    getLogsForHabit,
    refresh: refreshLogs,
  } = useLogs(user?.id, habits.map((h) => h.id));
  const { unacknowledged, refresh: refreshPunishments } = usePunishments(user?.id);

  const loading = habitsLoading || logsLoading;
  const todayHabits = habits.filter((h) => isTargetDay(h));
  const doneCount = todayHabits.filter((h) => {
    const s = getTodayStatusForHabit(h.id);
    return s === 'done' || s === 'grace';
  }).length;
  const progressPct =
    todayHabits.length > 0 ? Math.round((doneCount / todayHabits.length) * 100) : 100;

  useEffect(() => {
    if (habits.length > 0) {
      scheduleAllHabitReminders(habits);
    }
  }, [habits.map((h) => h.id).join(',')]);

  useEffect(() => {
    async function syncAppBlocker() {
      const enabled = await getAppBlockerEnabled();
      if (!enabled) return;
      const allDone = doneCount >= todayHabits.length;
      await blockSelectedApps(!allDone);
    }
    syncAppBlocker();
  }, [doneCount, todayHabits.length]);

  async function handleLog(habitId: string, status: HabitLog['status']) {
    if (!user) return;
    await logHabit(habitId, status);
    await cancelHabitNotifications(habitId);
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      const habitLogs = getLogsForHabit(habitId);
      await evaluatePunishments(habit, habitLogs, user.id);
    }
    await refreshPunishments();
  }

  async function handleGrace(habitId: string) {
    if (!user) return;
    const now = new Date();
    const { error } = await supabase.from('grace_days').upsert(
      {
        habit_id: habitId,
        user_id: user.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        used: true,
      },
      { onConflict: 'habit_id,month,year' }
    );
    if (!error) {
      await logHabit(habitId, 'grace');
      await cancelHabitNotifications(habitId);
    }
  }

  async function onRefresh() {
    await Promise.all([refreshHabits(), refreshLogs(), refreshPunishments()]);
  }

  if (loading && habits.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
          <Text style={{ color: Colors.textMuted, fontSize: 14 }}>{formatTodayHeader()}</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            <Text style={{ color: Colors.text, fontSize: 26, fontWeight: '800' }}>
              {getGreeting()}, Mario 👋
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/add-habit')}
              style={{
                backgroundColor: Colors.accent,
                borderRadius: 20,
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{ color: Colors.bg, fontWeight: '800', fontSize: 22, lineHeight: 26 }}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress ring */}
        <View style={{ alignItems: 'center', paddingBottom: 24 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: Colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 8,
              borderColor: progressPct === 100 ? Colors.accent : Colors.border,
            }}
          >
            <Text style={{ color: Colors.accent, fontSize: 32, fontWeight: '800' }}>
              {progressPct}%
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 11 }}>
              {doneCount}/{todayHabits.length}
            </Text>
          </View>
        </View>

        {/* App blocker banner */}
        {doneCount < todayHabits.length && todayHabits.length > 0 && (
          <View
            style={{
              backgroundColor: Colors.surfaceAlt,
              borderRadius: 12,
              padding: 12,
              marginHorizontal: 20,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderLeftWidth: 3,
              borderLeftColor: Colors.danger,
            }}
          >
            <Text style={{ fontSize: 16 }}>🔵</Text>
            <Text style={{ color: Colors.text, fontSize: 13, flex: 1 }}>
              Instagram & TikTok are blocked. Finish your habits.
            </Text>
          </View>
        )}

        {/* Punishment banner */}
        <PunishmentBanner count={unacknowledged.length} />

        {/* Habits */}
        <View style={{ paddingHorizontal: 20 }}>
          {todayHabits.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 20 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🎯</Text>
              <Text
                style={{
                  color: Colors.text,
                  fontWeight: '700',
                  fontSize: 18,
                  marginBottom: 8,
                }}
              >
                No habits for today
              </Text>
              <Text
                style={{ color: Colors.textMuted, fontSize: 14, marginBottom: 24 }}
              >
                Tap + to add your first habit
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/add-habit')}
                style={{
                  backgroundColor: Colors.accent,
                  borderRadius: 12,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: Colors.bg, fontWeight: '700' }}>Add Habit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            todayHabits.map((habit) => {
              const habitLogs = getLogsForHabit(habit.id);
              const streak = calculateStreaks(habitLogs);
              const todayStatus = getTodayStatusForHabit(habit.id);
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  todayStatus={todayStatus}
                  streak={streak}
                  graceDayUsed={false}
                  isTargetToday
                  onLog={handleLog}
                  onGrace={handleGrace}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
