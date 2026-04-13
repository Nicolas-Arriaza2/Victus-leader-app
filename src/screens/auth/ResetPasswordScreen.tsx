import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { authApi } from '../../services/api/auth';
import { useAuth } from '../../hooks/useAuth';
import { AuthStackScreenProps } from '../../navigation/types';
import { storage } from '../../utils/storage';

export function ResetPasswordScreen({ route, navigation }: AuthStackScreenProps<'ResetPassword'>) {
  const { email } = route.params;
  const { login } = useAuth();

  // 6-digit code inputs
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const code = digits.join('');

  const handleDigit = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleReset = async () => {
    if (code.length < 6) {
      Alert.alert('Código incompleto', 'Ingresá el código de 6 dígitos.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Contraseña inválida', 'Debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Contraseñas no coinciden', 'Verificá que sean iguales.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.resetPassword(email, code, newPassword);
      await storage.setToken(data.access_token);
      // Login fresh to populate AuthContext
      await login({ email, password: newPassword });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Código inválido o expirado';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.forgotPassword(email);
      Alert.alert('Código reenviado', 'Revisá tu email.');
    } catch {
      Alert.alert('Código reenviado', 'Revisá tu email.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 56, marginBottom: 32, width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </Pressable>

        {/* Title */}
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#111', letterSpacing: -0.5 }}>
          Ingresá el código
        </Text>
        <Text style={{ fontSize: 15, color: '#6b7280', marginTop: 10, lineHeight: 22 }}>
          Te enviamos un código de 6 dígitos a{'\n'}
          <Text style={{ fontWeight: '700', color: '#374151' }}>{email}</Text>
        </Text>

        {/* 6-digit code inputs */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 36, justifyContent: 'center' }}>
          {digits.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              value={digit}
              onChangeText={(v) => handleDigit(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              style={{
                width: 48,
                height: 58,
                borderWidth: 2,
                borderColor: digit ? '#2D7E34' : '#e5e7eb',
                borderRadius: 14,
                fontSize: 24,
                fontWeight: '700',
                textAlign: 'center',
                color: '#111',
                backgroundColor: digit ? '#f0fdf4' : '#fff',
              }}
            />
          ))}
        </View>

        {/* Resend */}
        <Pressable onPress={handleResend} style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={{ fontSize: 14, color: '#2D7E34', fontWeight: '600' }}>
            Reenviar código
          </Text>
        </Pressable>

        {/* New password */}
        <View style={{ marginTop: 32, gap: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 2 }}>
            Nueva contraseña
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14 }}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Mínimo 8 caracteres"
              secureTextEntry={!showPass}
              style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111' }}
            />
            <Pressable onPress={() => setShowPass((v) => !v)} style={{ paddingHorizontal: 14 }}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: 16, gap: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 2 }}>
            Confirmar contraseña
          </Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repetí la contraseña"
            secureTextEntry={!showPass}
            style={{ borderWidth: 1.5, borderColor: confirmPassword && confirmPassword !== newPassword ? '#ef4444' : '#e5e7eb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111' }}
          />
          {confirmPassword !== '' && confirmPassword !== newPassword && (
            <Text style={{ fontSize: 12, color: '#ef4444' }}>Las contraseñas no coinciden</Text>
          )}
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleReset}
          disabled={loading || code.length < 6}
          style={{ marginTop: 28, backgroundColor: (loading || code.length < 6) ? '#e5e7eb' : '#2D7E34', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
        >
          <Text style={{ color: (loading || code.length < 6) ? '#9ca3af' : '#fff', fontWeight: '700', fontSize: 16 }}>
            {loading ? 'Guardando...' : 'Restablecer contraseña'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
