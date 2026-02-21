import React, { useState } from 'react';
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
import { VictusLogo } from '../../components/VictusLogo';
import { useAuth } from '../../hooks/useAuth';
import { AuthStackScreenProps } from '../../navigation/types';

export function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Por favor completa email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Credenciales inválidas';
      Alert.alert('Error al ingresar', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-cream"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="mb-10 items-center">
          <VictusLogo width={100} height={100} />
          <Text className="text-gray-500 mt-3">Panel de Líderes</Text>
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
          />
        </View>

        {/* Password */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-1">Contraseña</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
        </View>

        {/* Submit */}
        <Pressable
          className={`rounded-xl py-4 items-center bg-primary-500 ${loading ? 'opacity-60' : ''}`}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white font-bold text-base">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Text>
        </Pressable>

        {/* Register link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">¿No tienes cuenta? </Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text className="text-secondary-500 font-semibold">Regístrate</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
