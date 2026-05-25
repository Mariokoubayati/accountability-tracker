import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { usePunishments } from '../hooks/usePunishments';
import { Colors } from '../constants/colors';

export default function PunishmentAlertScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { unacknowledged, acknowledge, loading } = usePunishments(user?.id);

  const current = unacknowledged[0];

  async function handleAccept() {
    if (!current) return;
    await acknowledge(current.id);
    if (unacknowledged.length <= 1) {
      router.replace('/(tabs)');
    }
  }

  if (loading || !current) {
    return null;
  }

  const triggeredDate = new Date(current.triggered_at);
  const dateStr = triggeredDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.punishment }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        {/* Warning icon */}
        <Text style={{ fontSize: 64, marginBottom: 16 }}>⚠️</Text>

        <Text
          style={{
            color: Colors.text,
            fontSize: 13,
            fontWeight: '700',
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 16,
            opacity: 0.7,
          }}
        >
          Punishment Triggered
        </Text>

        {/* Remaining count */}
        {unacknowledged.length > 1 && (
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginBottom: 24,
            }}
          >
            <Text style={{ color: Colors.text, fontSize: 13, fontWeight: '600' }}>
              {unacknowledged.length} punishments pending
            </Text>
          </View>
        )}

        {/* Type badge */}
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 4,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: Colors.text,
              fontSize: 12,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {current.type === 'consecutive' ? '2 Consecutive Misses' : 'Weekly Miss Limit'}
          </Text>
        </View>

        {/* Punishment card */}
        <View
          style={{
            backgroundColor: Colors.text,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: Colors.punishment,
              fontSize: 22,
              fontWeight: '800',
              marginBottom: 16,
              textAlign: 'center',
              lineHeight: 28,
            }}
          >
            {current.punishment_text}
          </Text>
          <View
            style={{
              height: 1,
              backgroundColor: Colors.border,
              marginBottom: 12,
            }}
          />
          <Text
            style={{
              color: Colors.textMuted,
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            Triggered on {dateStr}
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={handleAccept}
          style={{
            backgroundColor: Colors.text,
            borderRadius: 16,
            paddingVertical: 18,
            width: '100%',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <Text
            style={{
              color: Colors.punishment,
              fontWeight: '800',
              fontSize: 16,
            }}
          >
            I Accept This Punishment
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
