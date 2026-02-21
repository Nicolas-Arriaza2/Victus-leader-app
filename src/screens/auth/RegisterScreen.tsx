import React, { useState } from 'react';
import { VictusLogo } from '../../components/VictusLogo';
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
import { useAuth } from '../../hooks/useAuth';
import { AuthStackScreenProps } from '../../navigation/types';

export function RegisterScreen({ navigation }: AuthStackScreenProps<'Register'>) {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password || !firstName.trim()) {
      Alert.alert('Campos requeridos', 'Nombre, email y contraseña son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        role: 'COMMUNITY_LEADER',
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al registrarse';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
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
        {/* Header */}
        <View className="mb-8 items-center">
          <VictusLogo width={80} height={80} />
          <Text className="text-2xl font-bold text-gray-900 mt-4">Crear cuenta</Text>
          <Text className="text-gray-500 mt-1">Regístrate como Líder Victus</Text>
        </View>

        {/* First Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Nombre *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            placeholder="María"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Last Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Apellido</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            placeholder="González"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Email *</Text>
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
          <Text className="text-sm font-medium text-gray-700 mb-1">Contraseña *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
        </View>

        {/* Submit */}
        <Pressable
          className={`rounded-xl py-4 items-center bg-primary-500 ${loading ? 'opacity-60' : ''}`}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text className="text-white font-bold text-base">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Text>
        </Pressable>

        {/* Login link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">¿Ya tienes cuenta? </Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text className="text-secondary-500 font-semibold">Ingresar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
