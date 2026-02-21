import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  Text,
  View,
} from 'react-native';
import { activitiesApi } from '../../services/api/activities';
import { Activity } from '../../types/api';
import { ActivitiesStackScreenProps } from '../../navigation/types';

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  trekking: 'Trekking', theater: 'Teatro', dance: 'Danza', fitness: 'Fitness',
  outdoor: 'Outdoor', wellness: 'Bienestar', gastronomy: 'Gastronomía',
  music: 'Música', art: 'Arte', sports: 'Deportes', other: 'Otro',
};

export function ActivitiesListScreen({ navigation }: ActivitiesStackScreenProps<'ActivitiesList'>) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await activitiesApi.mine();
      setActivities(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return activities;
    const q = search.toLowerCase();
    return activities.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.description ?? '').toLowerCase().includes(q) ||
        (ACTIVITY_TYPE_LABELS[a.type] ?? a.type).toLowerCase().includes(q),
    );
  }, [activities, search]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      {/* Barra de búsqueda */}
      <View className="px-4 pt-3 pb-1">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 gap-2">
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 py-3 text-gray-900 text-sm"
            placeholder="Buscar actividades..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2D7E34" />}
        contentContainerClassName="p-4 gap-3"
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-400 mt-3 text-base">
              {search ? 'Sin resultados' : 'Sin actividades todavía'}
            </Text>
            {!search && (
              <Text className="text-gray-400 text-sm mt-1">Toca + para crear tu primera actividad</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
                <Text className="text-sm text-primary-500 mt-0.5">
                  {ACTIVITY_TYPE_LABELS[item.type] ?? item.type}
                </Text>
              </View>
              <View className={`px-2 py-0.5 rounded-full ${item.isActive ? 'bg-primary-50' : 'bg-gray-100'}`}>
                <Text className={`text-xs font-medium ${item.isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                  {item.isActive ? 'Activa' : 'Inactiva'}
                </Text>
              </View>
            </View>
            {item.description ? (
              <Text className="text-sm text-gray-500 mt-2" numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            {item.interests.length > 0 && (
              <View className="flex-row flex-wrap gap-1 mt-2">
                {item.interests.slice(0, 3).map(({ interest }) => (
                  <View key={interest.id} className="bg-cream px-2 py-0.5 rounded-full border border-gray-200">
                    <Text className="text-xs text-gray-600">{interest.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        )}
      />

      {/* FAB */}
      <Pressable
        className="absolute bottom-6 right-6 bg-primary-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('ActivityCreate')}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>
    </View>
  );
}
