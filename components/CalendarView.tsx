import { View, Text } from 'react-native';
import { HabitLog } from '../types';
import { Colors } from '../constants/colors';

type CalendarViewProps = {
  logs: HabitLog[];
  month: Date;
};

const STATUS_COLORS: Record<string, string> = {
  done: Colors.accent,
  missed: Colors.danger,
  grace: Colors.warning,
  future: Colors.border,
  none: Colors.surfaceAlt,
};

function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days: Date[] = [];
  const count = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= count; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}

function toKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function CalendarView({ logs, month }: CalendarViewProps) {
  const logMap = new Map<string, HabitLog['status']>();
  for (const log of logs) {
    logMap.set(log.date, log.status);
  }

  const days = getDaysInMonth(month);
  const today = toKey(new Date());
  const firstDayOfWeek = days[0].getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }
  for (const d of days) {
    cells.push(d);
  }

  return (
    <View>
      <Text
        style={{
          color: Colors.text,
          fontWeight: '700',
          fontSize: 16,
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {DAY_LABELS.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: Colors.textMuted, fontSize: 12, fontWeight: '600' }}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, idx) => {
          if (!day) {
            return <View key={`empty-${idx}`} style={{ width: '14.28%', aspectRatio: 1 }} />;
          }
          const key = toKey(day);
          const status = logMap.get(key);
          const isFuture = key > today;
          const isToday = key === today;

          let bg = STATUS_COLORS.none;
          if (isFuture) bg = STATUS_COLORS.future;
          else if (status) bg = STATUS_COLORS[status];

          return (
            <View
              key={key}
              style={{
                width: '14.28%',
                aspectRatio: 1,
                padding: 2,
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: bg,
                  borderRadius: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: isToday ? 2 : 0,
                  borderColor: Colors.accent,
                }}
              >
                <Text
                  style={{
                    color: status === 'done' || status === 'grace' ? Colors.bg : Colors.text,
                    fontSize: 12,
                    fontWeight: isToday ? '800' : '400',
                  }}
                >
                  {day.getDate()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 16, marginTop: 12, justifyContent: 'center' }}>
        {[
          { color: Colors.accent, label: 'Done' },
          { color: Colors.danger, label: 'Missed' },
          { color: Colors.warning, label: 'Grace' },
          { color: Colors.surfaceAlt, label: 'Not logged' },
        ].map(({ color, label }) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                backgroundColor: color,
              }}
            />
            <Text style={{ color: Colors.textMuted, fontSize: 11 }}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
