import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/colors';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert('Check your email', 'We sent you a confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Authentication failed.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text
          style={{
            color: Colors.accent,
            fontSize: 36,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Accountability
        </Text>
        <Text
          style={{
            color: Colors.textMuted,
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          No excuses. No mercy.
        </Text>

        <TextInput
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
          }}
          placeholder="Email"
          placeholderTextColor={Colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={{
            backgroundColor: Colors.surfaceAlt,
            color: Colors.text,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
          placeholder="Password"
          placeholderTextColor={Colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          onPress={handleAuth}
          disabled={loading}
          style={{
            backgroundColor: Colors.accent,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          {loading ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <Text style={{ color: Colors.bg, fontWeight: '700', fontSize: 16 }}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={{ alignItems: 'center' }}>
          <Text style={{ color: Colors.textMuted, fontSize: 14 }}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
