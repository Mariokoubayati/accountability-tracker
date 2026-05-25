import { View, Text } from 'react-native';
import { Colors } from '../constants/colors';

type StreakBadgeProps = {
  current: number;
  longest: number;
  compact?: boolean;
};

export function StreakBadge({ current, longest, compact = false }: StreakBadgeProps) {
  if (compact) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 14 }}>🔥</Text>
        <Text
          style={{
            color: current > 0 ? Colors.accent : Colors.textMuted,
            fontWeight: '700',
            fontSize: 14,
          }}
        >
          {current}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: Colors.accent, fontSize: 48, fontWeight: '800', lineHeight: 56 }}>
          {current}
        </Text>
        <Text style={{ color: Colors.textMuted, fontSize: 11, fontWeight: '600' }}>
          🔥 CURRENT
        </Text>
      </View>
      <View
        style={{
          width: 1,
          backgroundColor: Colors.border,
          marginVertical: 4,
        }}
      />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: Colors.text, fontSize: 48, fontWeight: '800', lineHeight: 56 }}>
          {longest}
        </Text>
        <Text style={{ color: Colors.textMuted, fontSize: 11, fontWeight: '600' }}>
          🏆 BEST
        </Text>
      </View>
    </View>
  );
}
