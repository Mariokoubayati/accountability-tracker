import { TouchableOpacity, Text } from 'react-native';
import { Colors } from '../constants/colors';

type GraceDayButtonProps = {
  onPress: () => void;
};

export function GraceDayButton({ onPress }: GraceDayButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: Colors.warning + '20',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: Colors.warning + '50',
      }}
    >
      <Text style={{ color: Colors.warning, fontSize: 11, fontWeight: '600' }}>GRACE</Text>
    </TouchableOpacity>
  );
}
