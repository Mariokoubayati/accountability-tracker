import { useEffect } from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';

type LogButtonProps = {
  done: boolean;
  onPress: () => void;
  size?: number;
};

export function LogButton({ done, onPress, size = 44 }: LogButtonProps) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(done ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(done ? 1 : 0, { duration: 300 });
  }, [done]);

  function handlePress() {
    scale.value = withSpring(0.85, { damping: 10, stiffness: 200 }, () => {
      scale.value = withSpring(1, { damping: 8, stiffness: 180 });
    });
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    runOnJS(onPress)();
  }

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(progress.value, [0, 1], [Colors.surfaceAlt, Colors.accent]),
    width: size,
    height: size,
    borderRadius: size / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: done ? 0 : 2,
    borderColor: Colors.border,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: withTiming(done ? 1 : 0, { duration: 200 }),
    transform: [{ scale: withSpring(done ? 1 : 0.5) }],
  }));

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={containerStyle}>
        <Animated.Text style={[checkStyle, { fontSize: size * 0.45 }]}>✓</Animated.Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
