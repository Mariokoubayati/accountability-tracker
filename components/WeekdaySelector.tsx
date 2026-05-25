import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type WeekdaySelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function WeekdaySelector({ value, onChange }: WeekdaySelectorProps) {
  const isDaily = value === 'daily';
  const selected = isDaily ? [0, 1, 2, 3, 4, 5, 6] : value.split(',').map(Number);

  function toggleDay(day: number) {
    const current = isDaily ? [0, 1, 2, 3, 4, 5, 6] : [...selected];
    const index = current.indexOf(day);
    let next: number[];
    if (index >= 0) {
      next = current.filter((d) => d !== day);
    } else {
      next = [...current, day].sort();
    }
    if (next.length === 7) {
      onChange('daily');
    } else if (next.length === 0) {
      onChange('daily');
    } else {
      onChange(next.join(','));
    }
  }

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {DAYS.map((label, i) => {
        const active = selected.includes(i);
        return (
          <TouchableOpacity
            key={i}
            onPress={() => toggleDay(i)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: active ? Colors.accent : Colors.surfaceAlt,
              borderWidth: 1,
              borderColor: active ? Colors.accent : Colors.border,
            }}
          >
            <Text
              style={{
                color: active ? Colors.bg : Colors.textMuted,
                fontWeight: '700',
                fontSize: 12,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
