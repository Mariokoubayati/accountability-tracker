import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Habit } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function parseReminderTime(reminderTime: string): { hour: number; minute: number } {
  const [h, m] = reminderTime.split(':').map(Number);
  return { hour: h, minute: m };
}

function notificationIdForHabit(habitId: string): string {
  return `habit-reminder-${habitId}`;
}

function nagIdForHabit(habitId: string, nagIndex: number): string {
  return `habit-nag-${habitId}-${nagIndex}`;
}

const NAG_MESSAGES = [
  (name: string) => `Still waiting on ${name}. You said you would.`,
  (name: string) => `${name} isn't going to do itself.`,
  (name: string) => `Last chance. Log ${name} or take the L.`,
];

export async function scheduleHabitReminder(habit: Habit): Promise<void> {
  await cancelHabitNotifications(habit.id);

  const { hour, minute } = parseReminderTime(habit.reminder_time);

  await Notifications.scheduleNotificationAsync({
    identifier: notificationIdForHabit(habit.id),
    content: {
      title: 'Accountability',
      body: `Time for ${habit.name} 💪 Don't lose your streak.`,
      data: { habitId: habit.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  for (let i = 0; i < 3; i++) {
    const nagHour = hour + 2 + i * 2;
    if (nagHour >= 22) break;
    await Notifications.scheduleNotificationAsync({
      identifier: nagIdForHabit(habit.id, i),
      content: {
        title: habit.name,
        body: NAG_MESSAGES[i](habit.name),
        data: { habitId: habit.id },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: nagHour,
        minute,
      },
    });
  }
}

export async function cancelHabitNotifications(habitId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationIdForHabit(habitId));
  for (let i = 0; i < 3; i++) {
    await Notifications.cancelScheduledNotificationAsync(nagIdForHabit(habitId, i));
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleAllHabitReminders(habits: Habit[]): Promise<void> {
  await cancelAllNotifications();
  for (const habit of habits) {
    await scheduleHabitReminder(habit);
  }
}
