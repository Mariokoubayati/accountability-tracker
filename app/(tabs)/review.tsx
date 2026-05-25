import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useHabits } from '../../hooks/useHabits';
import { useLogs } from '../../hooks/useLogs';
import { Colors } from '../../constants/colors';
import { calculateStreaks } from '../../lib/streaks';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getWeekRange(): { start: Date; end: Date } {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function toKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function ReviewScreen() {
  const { user } = useAuth();
  const { habits } = useHabits(user?.id);
  const { logs } = useLogs(user?.id, habits.map((h) => h.id));

  const { start, end } = getWeekRange();

  const weekLogs = logs.filter((l) => {
    const d = new Date(l.date);
    return d >= start && d <= end;
  });

  const weekDone = weekLogs.filter((l) => l.status === 'done' || l.status === 'grace').length;
  const weekMissed = weekLogs.filter((l) => l.status === 'missed').length;
  const weekTotal = weekDone + weekMissed;
  const weekRate = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 100;

  const missPatternMap = new Array(7).fill(0);
  for (const log of weekLogs) {
    if (log.status === 'missed') {
      missPatternMap[new Date(log.date).getDay()]++;
    }
  }
  const worstDayIndex = missPatternMap.indexOf(Math.max(...missPatternMap));
  const hasMissPattern = Math.max(...missPatternMap) > 0;

  const habitStats = habits.map((habit) => {
    const habitWeekLogs = weekLogs.filter((l) => l.habit_id === habit.id);
    const habitAllLogs = logs.filter((l) => l.habit_id === habit.id);
    const done = habitWeekLogs.filter((l) => l.status === 'done' || l.status === 'grace').length;
    const total = habitWeekLogs.length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 100;
    const streak = calculateStreaks(habitAllLogs);
    return { habit, done, total, rate, streak };
  });

  async function shareWeeklySummary() {
    const lines = [
      `📊 Weekly Review — ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
      '',
      `✅ Done: ${weekDone} | ❌ Missed: ${weekMissed} | 📈 Rate: ${weekRate}%`,
      '',
      '--- Per Habit ---',
      ...habitStats.map(
        (s) =>
          `${s.habit.icon} ${s.habit.name}: ${s.done}/${s.total} (${s.rate}%) | 🔥 ${s.streak.currentStreak}`
      ),
      '',
      hasMissPattern ? `⚠️ Most misses on ${DAY_NAMES[worstDayIndex]}s` : '🎉 No miss pattern this week!',
    ];
    await Share.share({ message: lines.join('\n') });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Text style={{ color: Colors.text, fontSize: 28, fontWeight: '800' }}>
            Weekly Review
          </Text>
          <TouchableOpacity
            onPress={shareWeeklySummary}
            style={{
              backgroundColor: Colors.surfaceAlt,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 14 }}>📤</Text>
            <Text style={{ color: Colors.text, fontWeight: '600', fontSize: 13 }}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Week summary */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: Colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 12 }}>
            {start.toLocaleDateString()} — {end.toLocaleDateString()}
          </Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: Colors.accent, fontSize: 36, fontWeight: '800' }}>
                {weekDone}
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Done</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: Colors.danger, fontSize: 36, fontWeight: '800' }}>
                {weekMissed}
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Missed</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: Colors.text, fontSize: 36, fontWeight: '800' }}>
                {weekRate}%
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Hit Rate</Text>
            </View>
          </View>
        </View>

        {/* Worst day pattern */}
        {hasMissPattern && (
          <View
            style={{
              backgroundColor: Colors.surfaceAlt,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderLeftWidth: 3,
              borderLeftColor: Colors.warning,
            }}
          >
            <Text style={{ fontSize: 20 }}>📉</Text>
            <Text style={{ color: Colors.text, fontSize: 14, flex: 1 }}>
              You most often miss on{' '}
              <Text style={{ color: Colors.warning, fontWeight: '700' }}>
                {DAY_NAMES[worstDayIndex]}s
              </Text>
            </Text>
          </View>
        )}

        {/* Per-habit breakdown */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>
            Habit Breakdown
          </Text>
          {habitStats.map(({ habit, done, total, rate, streak }) => (
            <View
              key={habit.id}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 10 }}>{habit.icon}</Text>
                <Text
                  style={{ color: Colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}
                  numberOfLines={1}
                >
                  {habit.name}
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 13 }}>
                  🔥 {streak.currentStreak}
                </Text>
              </View>
              {/* Hit rate bar */}
              <View
                style={{
                  height: 6,
                  backgroundColor: Colors.border,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${rate}%`,
                    backgroundColor: rate >= 80 ? Colors.accent : rate >= 50 ? Colors.warning : Colors.danger,
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 4 }}>
                {done}/{total} days — {rate}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
