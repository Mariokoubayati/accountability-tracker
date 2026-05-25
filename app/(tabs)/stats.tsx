import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useHabits } from '../../hooks/useHabits';
import { useLogs } from '../../hooks/useLogs';
import { Heatmap } from '../../components/Heatmap';
import { Colors } from '../../constants/colors';
import { calculateStreaks } from '../../lib/streaks';

export default function StatsScreen() {
  const { user } = useAuth();
  const { habits, loading: habitsLoading } = useHabits(user?.id);
  const { logs, loading: logsLoading } = useLogs(user?.id, habits.map((h) => h.id));

  const loading = habitsLoading || logsLoading;

  const habitStats = habits.map((habit) => {
    const habitLogs = logs.filter((l) => l.habit_id === habit.id);
    return { habit, streak: calculateStreaks(habitLogs) };
  });

  const sortedByStreak = [...habitStats].sort(
    (a, b) => b.streak.currentStreak - a.streak.currentStreak
  );

  const totalLogs = logs.length;
  const doneLogs = logs.filter((l) => l.status === 'done' || l.status === 'grace').length;
  const overallRate = totalLogs > 0 ? Math.round((doneLogs / totalLogs) * 100) : 0;

  const bestHabit = sortedByStreak[0];
  const worstHabit = [...habitStats].sort(
    (a, b) => b.streak.weeklyMissCount - a.streak.weeklyMissCount
  )[0];

  if (loading) {
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
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          style={{
            color: Colors.text,
            fontSize: 28,
            fontWeight: '800',
            marginBottom: 24,
          }}
        >
          Stats
        </Text>

        {/* Overall completion rate */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: Colors.surfaceAlt,
              borderWidth: 6,
              borderColor: Colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: Colors.accent, fontSize: 26, fontWeight: '800' }}>
              {overallRate}%
            </Text>
          </View>
          <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 16 }}>
            Overall Completion Rate
          </Text>
          <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 4 }}>
            {doneLogs} done / {totalLogs} total logs
          </Text>
        </View>

        {/* 90-day heatmap */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text
            style={{ color: Colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}
          >
            90-Day Activity
          </Text>
          <Heatmap logs={logs} habitCount={habits.length} days={90} />
        </View>

        {/* Best / Worst */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          {bestHabit && (
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.surface,
                borderRadius: 16,
                padding: 16,
                borderLeftWidth: 3,
                borderLeftColor: Colors.accent,
              }}
            >
              <Text style={{ color: Colors.accent, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>
                🏆 BEST HABIT
              </Text>
              <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                {bestHabit.habit.icon} {bestHabit.habit.name}
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 13 }}>
                🔥 {bestHabit.streak.currentStreak} day streak
              </Text>
            </View>
          )}
          {worstHabit && worstHabit.streak.weeklyMissCount > 0 && (
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.surface,
                borderRadius: 16,
                padding: 16,
                borderLeftWidth: 3,
                borderLeftColor: Colors.danger,
              }}
            >
              <Text
                style={{ color: Colors.danger, fontSize: 11, fontWeight: '700', marginBottom: 4 }}
              >
                ⚠️ NEEDS WORK
              </Text>
              <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                {worstHabit.habit.icon} {worstHabit.habit.name}
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 13 }}>
                {worstHabit.streak.weeklyMissCount} misses this week
              </Text>
            </View>
          )}
        </View>

        {/* Streak leaderboard */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text
            style={{ color: Colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}
          >
            Streak Leaderboard
          </Text>
          {sortedByStreak.length === 0 ? (
            <Text style={{ color: Colors.textMuted, fontSize: 14 }}>No habits yet.</Text>
          ) : (
            sortedByStreak.map(({ habit, streak }, index) => (
              <View
                key={habit.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: index < sortedByStreak.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <Text
                  style={{
                    color: index === 0 ? Colors.warning : Colors.textMuted,
                    fontWeight: '700',
                    width: 24,
                    fontSize: 14,
                  }}
                >
                  {index + 1}
                </Text>
                <Text style={{ fontSize: 20, marginRight: 10 }}>{habit.icon}</Text>
                <Text
                  style={{ color: Colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}
                  numberOfLines={1}
                >
                  {habit.name}
                </Text>
                <Text style={{ color: Colors.accent, fontWeight: '700', fontSize: 14 }}>
                  🔥 {streak.currentStreak}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
