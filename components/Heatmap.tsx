import { View, Text, ScrollView } from 'react-native';
import { HabitLog } from '../types';
import { Colors } from '../constants/colors';

type HeatmapProps = {
  logs: HabitLog[];
  habitCount: number;
  days?: number;
};

function toKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getHeatmapColor(completionRatio: number): string {
  if (completionRatio === 0) return '#0D2818';
  if (completionRatio <= 0.25) return '#003319';
  if (completionRatio <= 0.5) return '#006633';
  if (completionRatio <= 0.75) return '#00994D';
  return Colors.accent;
}

export function Heatmap({ logs, habitCount, days = 90 }: HeatmapProps) {
  const today = new Date();
  const dateRange: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dateRange.push(d);
  }

  const countMap = new Map<string, number>();
  for (const log of logs) {
    if (log.status === 'done' || log.status === 'grace') {
      countMap.set(log.date, (countMap.get(log.date) ?? 0) + 1);
    }
  }

  const weeks: Date[][] = [];
  let current: Date[] = [];
  const firstDay = dateRange[0];
  for (let pad = 0; pad < firstDay.getDay(); pad++) {
    current.push(new Date(0));
  }
  for (const day of dateRange) {
    current.push(day);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    weeks.push(current);
  }

  const CELL = 12;
  const GAP = 3;

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: GAP }}>
          {weeks.map((week, wi) => (
            <View key={wi} style={{ flexDirection: 'column', gap: GAP }}>
              {week.map((day, di) => {
                if (day.getTime() === 0) {
                  return (
                    <View
                      key={`pad-${wi}-${di}`}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 2,
                        backgroundColor: 'transparent',
                      }}
                    />
                  );
                }
                const key = toKey(day);
                const count = countMap.get(key) ?? 0;
                const ratio = habitCount > 0 ? count / habitCount : 0;
                const color = getHeatmapColor(ratio);
                return (
                  <View
                    key={key}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 2,
                      backgroundColor: color,
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 4,
          marginTop: 8,
        }}
      >
        <Text style={{ color: Colors.textMuted, fontSize: 10 }}>Less</Text>
        {[0, 0.25, 0.5, 0.75, 1].map((r) => (
          <View
            key={r}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: getHeatmapColor(r),
            }}
          />
        ))}
        <Text style={{ color: Colors.textMuted, fontSize: 10 }}>More</Text>
      </View>
    </View>
  );
}
