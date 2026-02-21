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
import { sessionsApi } from '../../services/api/sessions';
import { ActivitiesStackScreenProps } from '../../navigation/types';

// Builds an ISO string from date "DD/MM/YYYY" and time "HH:MM"
function toISO(date: string, time: string): string | null {
  const [day, month, year] = date.split('/');
  const [hour, minute] = time.split(':');
  if (!day || !month || !year || !hour || !minute) return null;
  const d = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function SessionCreateScreen({ route, navigation }: ActivitiesStackScreenProps<'SessionCreate'>) {
  const { activityId } = route.params;

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
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

    setLoading(true);
    try {
      await sessionsApi.create({
        activityId,
        startsAt,
        endsAt,
        capacity: capacity ? parseInt(capacity) : undefined,
        priceCents: price ? Math.round(parseFloat(price)) : undefined,
        locationName: locationName.trim() || undefined,
      });
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al crear sesión';
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
      <ScrollView contentContainerClassName="p-6 gap-5" keyboardShouldPersistTaps="handled">
        {/* Fecha */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Fecha *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            placeholder="DD/MM/YYYY"
            value={startDate}
            onChangeText={setStartDate}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
            maxLength={10}
          />
        </View>

        {/* Horario */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">Inicio *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
              placeholder="09:00"
              value={startTime}
              onChangeText={setStartTime}
              keyboardType="numbers-and-punctuation"
              returnKeyType="next"
              maxLength={5}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">Término *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
              placeholder="10:00"
              value={endTime}
              onChangeText={setEndTime}
              keyboardType="numbers-and-punctuation"
              returnKeyType="next"
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
              placeholder="20"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">Precio (CLP)</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
              placeholder="12000"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Lugar */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Lugar</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            placeholder="Ej: Parque Bicentenario, Vitacura"
            value={locationName}
            onChangeText={setLocationName}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
        </View>

        {/* Botón */}
        <Pressable
          className={`rounded-xl py-4 items-center bg-primary-500 ${loading ? 'opacity-60' : ''}`}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text className="text-white font-bold text-base">
            {loading ? 'Creando...' : 'Crear sesión'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
