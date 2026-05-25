import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Habit, HabitLog, StreakData } from '../types';
import { Colors } from '../constants/colors';
import { LogButton } from './LogButton';
import { StreakBadge } from './StreakBadge';
import { GraceDayButton } from './GraceDayButton';

type HabitCardProps = {
  habit: Habit;
  todayStatus: HabitLog['status'] | null;
  streak: StreakData;
  graceDayUsed: boolean;
  isTargetToday: boolean;
  onLog: (habitId: string, status: HabitLog['status']) => void;
  onGrace: (habitId: string) => void;
};

const DIFFICULTY_COLORS: Record<Habit['difficulty'], string> = {
  easy: '#34C759',
  medium: Colors.warning,
  hard: Colors.danger,
};

export function HabitCard({
  habit,
  todayStatus,
  streak,
  graceDayUsed,
  isTargetToday,
  onLog,
  onGrace,
}: HabitCardProps) {
  const router = useRouter();
  const isDone = todayStatus === 'done' || todayStatus === 'grace';

  return (
    <TouchableOpacity
      onPress={() => router.push(`/habit/${habit.id}`)}
      activeOpacity={0.7}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDone ? Colors.accent + '30' : Colors.border,
      }}
    >
      <Text style={{ fontSize: 32, marginRight: 12 }}>{habit.icon}</Text>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Text
            style={{
              color: Colors.text,
              fontSize: 18,
              fontWeight: '600',
              flex: 1,
            }}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
          <View
            style={{
              backgroundColor: DIFFICULTY_COLORS[habit.difficulty] + '20',
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                color: DIFFICULTY_COLORS[habit.difficulty],
                fontSize: 10,
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
            >
              {habit.difficulty}
            </Text>
          </View>
        </View>

        <StreakBadge current={streak.currentStreak} longest={streak.longestStreak} compact />
      </View>

      <View style={{ alignItems: 'center', gap: 8, marginLeft: 12 }}>
        {isTargetToday && !isDone && !graceDayUsed && (
          <GraceDayButton onPress={() => onGrace(habit.id)} />
        )}
        <LogButton
          done={isDone}
          onPress={() => {
            if (!isDone && isTargetToday) {
              onLog(habit.id, 'done');
            }
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
