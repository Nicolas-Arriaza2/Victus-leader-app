import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
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

export function ActivityEditScreen({ route, navigation }: ActivitiesStackScreenProps<'ActivityEdit'>) {
  const { activityId } = route.params;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('wellness');
  const [description, setDescription] = useState('');
  const [pricingModel, setPricingModel] = useState<ActivityPricingModel>('per_session');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      activitiesApi.getById(activityId),
      interestsApi.list(),
    ])
      .then(([{ data: act }, { data: allInterests }]) => {
        setTitle(act.title);
        setType(act.type);
        setDescription(act.description ?? '');
        setPricingModel(act.pricingModel);
        setMonthlyPrice(act.monthlyPriceCents ? String(act.monthlyPriceCents) : '');
        setIsActive(act.isActive);
        setInterests(allInterests);
        setSelectedInterestIds(act.interests.map(({ interest }) => interest.id));
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar la actividad'))
      .finally(() => setLoading(false));
  }, [activityId]);

  const toggleInterest = (id: string) => {
    setSelectedInterestIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      await activitiesApi.update(activityId, {
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        pricingModel,
        monthlyPriceCents:
          pricingModel === 'monthly_subscription' && monthlyPrice
            ? Math.round(parseFloat(monthlyPrice))
            : undefined,
        isActive,
        interestIds: selectedInterestIds,
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
        {/* Nombre */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Nombre *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
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
              value={monthlyPrice}
              onChangeText={setMonthlyPrice}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>
        )}

        {/* Activa */}
        <View className="flex-row items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-300">
          <Text className="text-base text-gray-800">Actividad activa</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ true: '#2D7E34' }}
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
