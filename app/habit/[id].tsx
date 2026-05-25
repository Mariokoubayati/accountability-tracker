import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useHabits } from '../../hooks/useHabits';
import { useLogs } from '../../hooks/useLogs';
import { CalendarView } from '../../components/CalendarView';
import { StreakBadge } from '../../components/StreakBadge';
import { Colors } from '../../constants/colors';
import { calculateStreaks } from '../../lib/streaks';

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { habits, deleteHabit } = useHabits(user?.id);
  const { getLogsForHabit } = useLogs(user?.id, id ? [id] : []);

  const [calMonth, setCalMonth] = useState(new Date());

  const habit = habits.find((h) => h.id === id);
  const logs = id ? getLogsForHabit(id) : [];
  const streak = calculateStreaks(logs);

  if (!habit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.textMuted }}>Habit not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  async function handleDelete() {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit!.name}"? All logs will be lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(habit!.id);
            router.back();
          },
        },
      ]
    );
  }

  function prevMonth() {
    const d = new Date(calMonth);
    d.setMonth(d.getMonth() - 1);
    setCalMonth(d);
  }

  function nextMonth() {
    const d = new Date(calMonth);
    d.setMonth(d.getMonth() + 1);
    setCalMonth(d);
  }

  const completionRate =
    streak.totalCompletions > 0 && logs.length > 0
      ? Math.round((streak.totalCompletions / logs.length) * 100)
      : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: Colors.accent, fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: Colors.text, fontSize: 22, fontWeight: '700', flex: 1 }}>
          {habit.icon} {habit.name}
        </Text>
        <TouchableOpacity onPress={() => router.push(`/add-habit?id=${habit.id}`)} style={{ marginRight: 12 }}>
          <Text style={{ color: Colors.accent, fontSize: 14 }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={{ color: Colors.danger, fontSize: 14 }}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Streak badges */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            alignItems: 'center',
          }}
        >
          <StreakBadge current={streak.currentStreak} longest={streak.longestStreak} />
        </View>

        {/* Stats row */}
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.surface,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: Colors.accent, fontSize: 28, fontWeight: '800' }}>
              {streak.totalCompletions}
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Total Done</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.surface,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: Colors.text, fontSize: 28, fontWeight: '800' }}>
              {completionRate}%
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Completion</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.surface,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: streak.weeklyMissCount > 0 ? Colors.danger : Colors.accent,
                fontSize: 28,
                fontWeight: '800',
              }}
            >
              {streak.weeklyMissCount}
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Misses (7d)</Text>
          </View>
        </View>

        {/* Calendar */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <TouchableOpacity onPress={prevMonth}>
              <Text style={{ color: Colors.accent, fontSize: 20 }}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextMonth}>
              <Text style={{ color: Colors.accent, fontSize: 20 }}>›</Text>
            </TouchableOpacity>
          </View>
          <CalendarView logs={logs} month={calMonth} />
        </View>

        {/* Habit details */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>
            Settings
          </Text>
          {[
            { label: 'Reminder', value: habit.reminder_time },
            { label: 'Difficulty', value: habit.difficulty },
            { label: 'Schedule', value: habit.target_days === 'daily' ? 'Every day' : habit.target_days },
            ...(habit.punishment_a ? [{ label: 'Punishment A', value: habit.punishment_a }] : []),
            ...(habit.punishment_b_text
              ? [{ label: `Punishment B (≥${habit.punishment_b_threshold} misses/wk)`, value: habit.punishment_b_text }]
              : []),
          ].map(({ label, value }) => (
            <View
              key={label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              }}
            >
              <Text style={{ color: Colors.textMuted, fontSize: 14 }}>{label}</Text>
              <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' }}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
