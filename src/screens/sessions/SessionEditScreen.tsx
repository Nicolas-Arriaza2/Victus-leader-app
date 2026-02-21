import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { sessionsApi } from '../../services/api/sessions';
import { ActivitiesStackScreenProps } from '../../navigation/types';

function toISO(date: string, time: string): string | null {
  const [day, month, year] = date.split('/');
  const [hour, minute] = time.split(':');
  if (!day || !month || !year || !hour || !minute) return null;
  const d = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function SessionEditScreen({ route, navigation }: ActivitiesStackScreenProps<'SessionEdit'>) {
  const { sessionId } = route.params;

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    sessionsApi
      .getById(sessionId)
      .then(({ data }) => {
        setStartDate(formatDate(data.startsAt));
        setStartTime(formatTime(data.startsAt));
        setEndTime(formatTime(data.endsAt));
        setCapacity(data.capacity != null ? String(data.capacity) : '');
        setPrice(data.priceCents != null ? String(data.priceCents) : '');
        setLocationName(data.locationName ?? '');
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar la sesión'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleSave = async () => {
    const startsAt = toISO(startDate, startTime);
    const endsAt = toISO(startDate, endTime);

    if (!startsAt || !endsAt) {
      Alert.alert('Error', 'Fecha u hora inválida. Usa el formato DD/MM/YYYY y HH:MM.');
      return;
    }
    if (endsAt <= startsAt) {
      Alert.alert('Error', 'La hora de término debe ser posterior al inicio.');
      return;
    }

    setSaving(true);
    try {
      await sessionsApi.update(sessionId, {
        startsAt,
        endsAt,
        capacity: capacity ? parseInt(capacity) : undefined,
        priceCents: price ? Math.round(parseFloat(price)) : undefined,
        locationName: locationName.trim() || undefined,
      });
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al guardar';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-cream"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerClassName="p-6 gap-5" keyboardShouldPersistTaps="handled">
        {/* Fecha */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Fecha</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            placeholder="DD/MM/YYYY"
            value={startDate}
            onChangeText={setStartDate}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
        </View>

        {/* Horario */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">Inicio</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
              placeholder="09:00"
              value={startTime}
              onChangeText={setStartTime}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">Término</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
              placeholder="10:00"
              value={endTime}
              onChangeText={setEndTime}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
        </View>

        {/* Capacidad y precio */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">Cupos</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">Precio (CLP)</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Lugar */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Lugar</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            value={locationName}
            onChangeText={setLocationName}
            returnKeyType="done"
          />
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
