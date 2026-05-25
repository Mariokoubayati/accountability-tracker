import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { Colors } from '../constants/colors';

const COMMON_EMOJIS = [
  '💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '🏋️', '🚴', '🏊',
  '✍️', '🎯', '🧠', '❤️', '🌅', '🎵', '🍎', '☕', '🧹', '💊',
  '🔥', '⭐', '✅', '🎸', '🏆', '🌟', '💡', '📝', '🕐', '🛁',
  '🚶', '🌿', '🥤', '🍵', '📖', '🎨', '🌙', '🧹', '🏠', '💰',
  '📱', '💻', '🎮', '🧩', '🃏', '🎲', '⚽', '🏀', '🎾', '🏓',
];

type EmojiPickerProps = {
  value: string;
  onChange: (emoji: string) => void;
};

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search
    ? COMMON_EMOJIS.filter((e) => e.includes(search))
    : COMMON_EMOJIS;

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          width: 64,
          height: 64,
          backgroundColor: Colors.surfaceAlt,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: Colors.border,
        }}
      >
        <Text style={{ fontSize: 32 }}>{value || '⭐'}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}
        >
          <View
            style={{
              backgroundColor: Colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              maxHeight: '60%',
            }}
          >
            <Text
              style={{
                color: Colors.text,
                fontWeight: '700',
                fontSize: 18,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Pick an Emoji
            </Text>
            <FlatList
              data={filtered}
              numColumns={7}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={{
                marginTop: 16,
                backgroundColor: Colors.surfaceAlt,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: Colors.textMuted, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
