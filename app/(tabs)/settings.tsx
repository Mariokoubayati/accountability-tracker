import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/colors';
import {
  getAppBlockerEnabled,
  setAppBlockerEnabled,
} from '../../lib/storage';
import {
  requestFamilyControlsAuthorization,
  presentAppPicker,
  blockSelectedApps,
  clearAllShields,
} from '../../lib/screenTime';

export default function SettingsScreen() {
  const [appBlockerOn, setAppBlockerOn] = useState(false);
  const [blockerLoading, setBlockerLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    getAppBlockerEnabled().then(setAppBlockerOn);
  }, []);

  async function toggleAppBlocker(value: boolean) {
    setBlockerLoading(true);
    try {
      if (value) {
        const authorized = await requestFamilyControlsAuthorization();
        if (!authorized) {
          Alert.alert(
            'Permission required',
            'Family Controls authorization is needed to block apps. Enable it in Settings > Screen Time.'
          );
          setBlockerLoading(false);
          return;
        }
      } else {
        clearAllShields();
        await blockSelectedApps(false);
      }
      await setAppBlockerEnabled(value);
      setAppBlockerOn(value);
    } catch {
      Alert.alert('Error', 'Could not toggle app blocker.');
    } finally {
      setBlockerLoading(false);
    }
  }

  async function handleSelectApps() {
    const authorized = await requestFamilyControlsAuthorization();
    if (!authorized) {
      Alert.alert(
        'Permission required',
        'Enable Family Controls in Settings > Screen Time first.'
      );
      return;
    }
    const result = await presentAppPicker();
    if (result === 'picker_requested') {
      Alert.alert(
        'App Picker',
        'The native iOS app picker will appear. Instagram and TikTok are pre-targeted — confirm your selection.'
      );
    } else if (result === 'unavailable') {
      Alert.alert('Not available', 'App blocking requires a real iPhone with iOS 16+.');
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          clearAllShields();
          await supabase.auth.signOut();
          setSigningOut(false);
        },
      },
    ]);
  }

  function Section({ title }: { title: string }) {
    return (
      <Text
        style={{
          color: Colors.textMuted,
          fontSize: 12,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginTop: 28,
          marginBottom: 8,
          paddingHorizontal: 4,
        }}
      >
        {title}
      </Text>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: Colors.text, fontSize: 28, fontWeight: '800', marginBottom: 8 }}>
          Settings
        </Text>

        <Section title="App Blocking" />
        {/* Requires com.apple.developer.family-controls entitlement enabled in Apple Developer portal */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.text, fontWeight: '600', fontSize: 16 }}>
                Block apps until habits logged
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 2 }}>
                Blocks selected apps until all today's habits are done
              </Text>
            </View>
            {blockerLoading ? (
              <ActivityIndicator color={Colors.accent} size="small" />
            ) : (
              <Switch
                value={appBlockerOn}
                onValueChange={toggleAppBlocker}
                trackColor={{ false: Colors.border, true: Colors.accent + '80' }}
                thumbColor={appBlockerOn ? Colors.accent : Colors.textMuted}
              />
            )}
          </View>

          <TouchableOpacity
            onPress={handleSelectApps}
            style={{
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={{ color: Colors.text, fontWeight: '600', fontSize: 16 }}>
                Select apps to block
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 2 }}>
                Instagram & TikTok pre-targeted
              </Text>
            </View>
            <Text style={{ color: Colors.textMuted, fontSize: 16 }}>›</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: Colors.surfaceAlt,
            borderRadius: 12,
            padding: 12,
            marginTop: 8,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
            ⚠️ App blocking requires the "Family Controls" entitlement. Enable it in your Apple Developer portal under App IDs → Capabilities before building.
          </Text>
        </View>

        <Section title="Notifications" />
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Text style={{ color: Colors.text, fontSize: 15 }}>
            Reminders are scheduled automatically based on each habit's reminder time. Nag notifications fire every 2 hours after the initial reminder until 10 PM.
          </Text>
        </View>

        <Section title="Account" />
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <TouchableOpacity
            onPress={handleSignOut}
            disabled={signingOut}
            style={{
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: Colors.danger, fontWeight: '600', fontSize: 16 }}>
              {signingOut ? 'Signing out…' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
