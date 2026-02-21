import React, { useEffect, useState } from 'react';
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
import { usersApi } from '../../services/api/users';
import { useAuth } from '../../hooks/useAuth';
import { Gender } from '../../types/api';
import { ProfileStackScreenProps } from '../../navigation/types';

const GENDERS: { label: string; value: Gender }[] = [
  { label: 'Femenino', value: 'female' },
  { label: 'Masculino', value: 'male' },
  { label: 'No binario', value: 'non_binary' },
  { label: 'Prefiero no decir', value: 'na' },
];

export function EditProfileScreen({ navigation }: ProfileStackScreenProps<'EditProfile'>) {
  const { user, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.profile?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.profile?.lastName ?? '');
  const [bio, setBio] = useState(user?.profile?.bio ?? '');
  const [gender, setGender] = useState<Gender | null>(
    (user?.profile?.gender as Gender) ?? null,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      await usersApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        bio: bio.trim() || undefined,
        gender: gender ?? undefined,
      });
      await refreshUser();
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al guardar';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-cream"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerClassName="p-6 gap-5" keyboardShouldPersistTaps="handled">
        {/* Email (read-only) */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
          <View className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
            <Text className="text-gray-400 text-base">{user?.email}</Text>
          </View>
        </View>

        {/* Nombre */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Nombre *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Apellido */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Apellido</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Bio */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Biografía</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
            placeholder="Cuéntanos sobre ti y tus actividades..."
          />
        </View>

        {/* Género */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Género</Text>
          <View className="flex-row flex-wrap gap-2">
            {GENDERS.map((g) => (
              <Pressable
                key={g.value}
                onPress={() => setGender(g.value)}
                className={`px-3 py-1.5 rounded-full border ${
                  gender === g.value
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`text-sm ${
                    gender === g.value ? 'text-white font-medium' : 'text-gray-700'
                  }`}
                >
                  {g.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Botón */}
        <Pressable
          className={`rounded-xl py-4 items-center bg-primary-500 ${saving ? 'opacity-60' : ''}`}
          onPress={handleSave}
          disabled={saving}
        >
          <Text className="text-white font-bold text-base">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
