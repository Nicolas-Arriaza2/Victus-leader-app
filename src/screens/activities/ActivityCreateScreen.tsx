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
import { activitiesApi } from '../../services/api/activities';
import { interestsApi } from '../../services/api/interests';
import { ActivityPricingModel, ActivityType, Interest } from '../../types/api';
import { ActivitiesStackScreenProps } from '../../navigation/types';

const TYPES: { label: string; value: ActivityType }[] = [
  { label: 'Bienestar', value: 'wellness' },
  { label: 'Fitness', value: 'fitness' },
  { label: 'Trekking', value: 'trekking' },
  { label: 'Teatro', value: 'theater' },
  { label: 'Danza', value: 'dance' },
  { label: 'Música', value: 'music' },
  { label: 'Arte', value: 'art' },
  { label: 'Outdoor', value: 'outdoor' },
  { label: 'Deportes', value: 'sports' },
  { label: 'Gastronomía', value: 'gastronomy' },
  { label: 'Otro', value: 'other' },
];

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 40) +
    '-' +
    Date.now().toString(36)
  );
}

export function ActivityCreateScreen({ navigation }: ActivitiesStackScreenProps<'ActivityCreate'>) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('wellness');
  const [description, setDescription] = useState('');
  const [pricingModel, setPricingModel] = useState<ActivityPricingModel>('per_session');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    interestsApi.list().then(({ data }) => setInterests(data)).catch(() => {});
  }, []);

  const toggleInterest = (id: string) => {
    setSelectedInterestIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }
    setLoading(true);
    try {
      const { data: created } = await activitiesApi.create({
        slug: slugify(title),
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        pricingModel,
        monthlyPriceCents:
          pricingModel === 'monthly_subscription' && monthlyPrice
            ? Math.round(parseFloat(monthlyPrice))
            : undefined,
        interestIds: selectedInterestIds.length > 0 ? selectedInterestIds : undefined,
      });
      navigation.replace('ActivityDetail', { activityId: created.id });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al crear actividad';
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
        {/* Nombre */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Nombre *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            placeholder="Ej: Yoga Flow Matutino"
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
          />
        </View>

        {/* Tipo */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Tipo</Text>
          <View className="flex-row flex-wrap gap-2">
            {TYPES.map((t) => (
              <Pressable
                key={t.value}
                onPress={() => setType(t.value)}
                className={`px-3 py-1.5 rounded-full border ${
                  type === t.value
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`text-sm ${
                    type === t.value ? 'text-white font-medium' : 'text-gray-700'
                  }`}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Descripción */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Descripción</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            placeholder="Describe tu actividad..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
          />
        </View>

        {/* Intereses */}
        {interests.length > 0 && (
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Intereses</Text>
            <View className="flex-row flex-wrap gap-2">
              {interests.map((interest) => {
                const selected = selectedInterestIds.includes(interest.id);
                return (
                  <Pressable
                    key={interest.id}
                    onPress={() => toggleInterest(interest.id)}
                    className={`px-3 py-1.5 rounded-full border ${
                      selected
                        ? 'bg-secondary-500 border-secondary-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text className={`text-sm ${selected ? 'text-white font-medium' : 'text-gray-700'}`}>
                      {interest.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Modelo de precio */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Modelo de precio</Text>
          <View className="flex-row gap-2">
            {[
              { label: 'Por sesión', value: 'per_session' as ActivityPricingModel },
              { label: 'Suscripción', value: 'monthly_subscription' as ActivityPricingModel },
            ].map((p) => (
              <Pressable
                key={p.value}
                onPress={() => setPricingModel(p.value)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  pricingModel === p.value
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    pricingModel === p.value ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Precio mensual */}
        {pricingModel === 'monthly_subscription' && (
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Precio mensual (CLP)</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
              placeholder="29000"
              value={monthlyPrice}
              onChangeText={setMonthlyPrice}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>
        )}

        {/* Botón */}
        <Pressable
          className={`rounded-xl py-4 items-center bg-primary-500 ${loading ? 'opacity-60' : ''}`}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text className="text-white font-bold text-base">
            {loading ? 'Creando...' : 'Crear actividad'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
