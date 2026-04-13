import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { authApi } from '../../services/api/auth';
import { AuthStackScreenProps } from '../../navigation/types';

export function ForgotPasswordScreen({ navigation }: AuthStackScreenProps<'ForgotPassword'>) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Campo requerido', 'Ingresá tu email.');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      navigation.navigate('ResetPassword', { email: email.trim().toLowerCase() });
    } catch {
      // Still navigate — backend always returns 200 to avoid enumeration
      navigation.navigate('ResetPassword', { email: email.trim().toLowerCase() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, padding: 24 }}>
        {/* Back */}
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 56, marginBottom: 32, width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </Pressable>

        {/* Title */}
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#111', letterSpacing: -0.5 }}>
          ¿Olvidaste tu contraseña?
        </Text>
        <Text style={{ fontSize: 15, color: '#6b7280', marginTop: 10, lineHeight: 22 }}>
          Ingresá tu email y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
        </Text>

        {/* Email input */}
        <View style={{ marginTop: 32 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoFocus
            style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111' }}
          />
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSend}
          disabled={loading}
          style={{ marginTop: 24, backgroundColor: loading ? '#86efac' : '#2D7E34', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            {loading ? 'Enviando...' : 'Enviar código'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
