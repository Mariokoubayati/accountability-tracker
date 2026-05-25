import '../global.css';
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { usePunishments } from '../hooks/usePunishments';
import { requestNotificationPermissions } from '../lib/notifications';

export default function RootLayout() {
  const { user, loading } = useAuth();
  const { unacknowledged } = usePunishments(user?.id);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inPunishment = segments[0] === 'punishment-alert';

    if (!user && !inAuthGroup) {
      router.replace('/auth');
      return;
    }

    if (user && inAuthGroup) {
      if (unacknowledged.length > 0) {
        router.replace('/punishment-alert');
      } else {
        router.replace('/(tabs)');
      }
      return;
    }

    if (user && !inAuthGroup && !inPunishment && unacknowledged.length > 0) {
      router.replace('/punishment-alert');
    }
  }, [user, loading, segments, unacknowledged.length]);

  useEffect(() => {
    if (user) {
      requestNotificationPermissions();
    }
  }, [user]);

  return <Slot />;
}
