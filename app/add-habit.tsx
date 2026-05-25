import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../hooks/useAuth';
import { useHabits } from '../hooks/useHabits';
import { EmojiPicker } from '../components/EmojiPicker';
import { WeekdaySelector } from '../components/WeekdaySelector';
import { Colors } from '../constants/colors';
import { Habit } from '../types';

type DifficultyLevel = Habit['difficulty'];

const DIFFICULTIES: DifficultyLevel[] = ['easy', 'medium', 'hard'];
const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: '#34C759',
  medium: Colors.warning,
  hard: Colors.danger,
};

function parseTime(timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function AddHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { habits, createHabit, updateHabit } = useHabits(user?.id);

  const existingHabit = id ? habits.find((h) => h.id === id) : undefined;
  const isEdit = !!existingHabit;

  const [name, setName] = useState(existingHabit?.name ?? '');
  const [icon, setIcon] = useState(existingHabit?.icon ?? '⭐');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(existingHabit?.difficulty ?? 'medium');
  const [targetDays, setTargetDays] = useState(existingHabit?.target_days ?? 'daily');
  const [reminderTime, setReminderTime] = useState<Date>(
    parseTime(existingHabit?.reminder_time ?? '09:00')
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [punishmentA, setPunishmentA] = useState(existingHabit?.punishment_a ?? '');
  const [punishmentBThreshold, setPunishmentBThreshold] = useState(
    String(existingHabit?.punishment_b_threshold ?? '3')
  );
  const [punishmentBText, setPunishmentBText] = useState(existingHabit?.punishment_b_text ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a habit name.');
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      icon,
      difficulty,
      target_days: targetDays,
      reminder_time: formatTime(reminderTime),
      punishment_a: punishmentA.trim(),
      punishment_b_threshold: parseInt(punishmentBThreshold, 10) || 3,
      punishment_b_text: punishmentBText.trim(),
      order_index: isEdit ? existingHabit!.order_index : habits.length,
    };
    if (isEdit) {
      await updateHabit(id!, payload);
    } else {
      await createHabit(payload);
    }
    setSaving(false);
    router.back();
  }

  function renderLabel(text: string) {
    return (
      <Text style={{ color: Colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' }}>
        {text}
      </Text>
    );
  }

  function renderInput(
    value: string,
    onChangeText: (t: string) => void,
    placeholder: string,
    multiline?: boolean
  ) {
    return (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        style={{
          backgroundColor: Colors.surfaceAlt,
          color: Colors.text,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: Colors.border,
          minHeight: multiline ? 80 : undefined,
          textAlignVertical: multiline ? 'top' : undefined,
        }}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
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
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Text style={{ color: Colors.textMuted, fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700', flex: 1 }}>
          {isEdit ? 'Edit Habit' : 'New Habit'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text
            style={{
              color: saving ? Colors.textMuted : Colors.accent,
              fontWeight: '700',
              fontSize: 16,
            }}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Icon + Name row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
          <EmojiPicker value={icon} onChange={setIcon} />
          <View style={{ flex: 1 }}>
            {renderLabel('Habit name')}
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Morning run"
              placeholderTextColor={Colors.textMuted}
              style={{
                backgroundColor: Colors.surfaceAlt,
                color: Colors.text,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 18,
                fontWeight: '600',
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            />
          </View>
        </View>

        {/* Difficulty */}
        {renderLabel('Difficulty')}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDifficulty(d)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor:
                  difficulty === d ? DIFFICULTY_COLORS[d] + '30' : Colors.surfaceAlt,
                borderWidth: 2,
                borderColor: difficulty === d ? DIFFICULTY_COLORS[d] : Colors.border,
              }}
            >
              <Text
                style={{
                  color: difficulty === d ? DIFFICULTY_COLORS[d] : Colors.textMuted,
                  fontWeight: '700',
                  fontSize: 13,
                  textTransform: 'capitalize',
                }}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Target days */}
        {renderLabel('Target days')}
        <View style={{ marginBottom: 20 }}>
          <WeekdaySelector value={targetDays} onChange={setTargetDays} />
        </View>

        {/* Reminder time */}
        {renderLabel('Reminder time')}
        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={{
            backgroundColor: Colors.surfaceAlt,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '600' }}>
            {formatTime(reminderTime)}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            is24Hour
            display="spinner"
            onChange={(_, date) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (date) setReminderTime(date);
            }}
            style={{ marginBottom: 20 }}
            textColor={Colors.text}
          />
        )}

        {/* Punishment A */}
        <View
          style={{
            backgroundColor: Colors.punishment + '15',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: Colors.punishment + '40',
          }}
        >
          <Text
            style={{
              color: Colors.danger,
              fontSize: 13,
              fontWeight: '700',
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            ⚡ Punishment A — 2 Consecutive Misses
          </Text>
          {renderLabel('What happens?')}
          {renderInput(punishmentA, setPunishmentA, 'e.g. No dessert for 3 days', true)}

          <Text
            style={{
              color: Colors.danger,
              fontSize: 13,
              fontWeight: '700',
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            ⚡ Punishment B — Weekly Miss Frequency
          </Text>
          {renderLabel('Misses per week to trigger')}
          <TextInput
            value={punishmentBThreshold}
            onChangeText={setPunishmentBThreshold}
            keyboardType="numeric"
            style={{
              backgroundColor: Colors.surfaceAlt,
              color: Colors.text,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: Colors.border,
              width: 80,
            }}
          />
          {renderLabel('What happens?')}
          {renderInput(punishmentBText, setPunishmentBText, 'e.g. 100 push-ups', true)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
