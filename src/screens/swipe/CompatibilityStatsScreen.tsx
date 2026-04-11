import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { CompatibilityStats, swipesApi } from '../../services/api/swipes';

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  trekking: 'Trekking',
  theater: 'Teatro',
  dance: 'Danza',
  fitness: 'Fitness',
  outdoor: 'Al aire libre',
  wellness: 'Bienestar',
  gastronomy: 'Gastronomía',
  music: 'Música',
  art: 'Arte',
  sports: 'Deporte',
  other: 'Otro',
};

export function CompatibilityStatsScreen() {
  const [stats, setStats] = useState<CompatibilityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    swipesApi.stats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  if (!stats || stats.totalMatches === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-8">
        <Ionicons name="heart-outline" size={64} color="#9ca3af" />
        <Text className="text-gray-500 text-lg font-semibold mt-4 text-center">
          Aún no tienes matches
        </Text>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          Haz swipe para conectar con personas y ver tus estadísticas de compatibilidad
        </Text>
      </View>
    );
  }

  const maxInterest = stats.topInterests[0]?.count ?? 1;
  const maxActivity = stats.topActivities[0]?.count ?? 1;

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerClassName="p-5 gap-5">
      {/* Total matches */}
      <View className="bg-primary-500 rounded-2xl p-6 items-center">
        <Text className="text-primary-100 text-sm font-medium">Matches totales</Text>
        <Text className="text-white text-5xl font-bold mt-1">{stats.totalMatches}</Text>
        <Text className="text-primary-200 text-xs mt-1">personas con intereses en común</Text>
      </View>

      {/* Top interests */}
      {stats.topInterests.length > 0 && (
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="sparkles-outline" size={20} color="#2D7E34" />
            <Text className="text-base font-bold text-gray-900">Intereses en común</Text>
          </View>
          <View className="gap-3">
            {stats.topInterests.map((item) => (
              <View key={item.name}>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-700 font-medium">{item.name}</Text>
                  <Text className="text-sm text-primary-600 font-semibold">{item.count}</Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className="h-2 bg-primary-400 rounded-full"
                    style={{ width: `${(item.count / maxInterest) * 100}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Top activities */}
      {stats.topActivities.length > 0 && (
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="calendar-outline" size={20} color="#2D7E34" />
            <Text className="text-base font-bold text-gray-900">Actividades populares entre tus matches</Text>
          </View>
          <View className="gap-3">
            {stats.topActivities.map((item) => (
              <View key={item.id}>
                <View className="flex-row justify-between mb-1">
                  <View className="flex-1 pr-2">
                    <Text className="text-sm text-gray-700 font-medium" numberOfLines={1}>{item.title}</Text>
                    <Text className="text-xs text-gray-400">{ACTIVITY_TYPE_LABELS[item.type] ?? item.type}</Text>
                  </View>
                  <Text className="text-sm text-secondary-600 font-semibold">{item.count}</Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className="h-2 bg-secondary-400 rounded-full"
                    style={{ width: `${(item.count / maxActivity) * 100}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className="h-4" />
    </ScrollView>
  );
}
