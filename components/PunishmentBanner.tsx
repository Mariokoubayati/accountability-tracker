import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';

type PunishmentBannerProps = {
  count: number;
};

export function PunishmentBanner({ count }: PunishmentBannerProps) {
  const router = useRouter();
  if (count === 0) return null;

  return (
    <TouchableOpacity
      onPress={() => router.push('/punishment-alert')}
      style={{
        backgroundColor: Colors.punishment,
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 18 }}>⚠️</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 14 }}>
          {count} Punishment{count > 1 ? 's' : ''} Pending
        </Text>
        <Text style={{ color: Colors.text + 'CC', fontSize: 12 }}>Tap to acknowledge</Text>
      </View>
    </TouchableOpacity>
  );
}
