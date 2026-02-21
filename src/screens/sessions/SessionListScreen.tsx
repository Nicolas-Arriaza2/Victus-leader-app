import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { sessionsApi } from '../../services/api/sessions';
import { ActivitySession } from '../../types/api';
import { ActivitiesStackScreenProps } from '../../navigation/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function SessionListScreen({ route, navigation }: ActivitiesStackScreenProps<'SessionList'>) {
  const { activityId } = route.params;
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await sessionsApi.list(activityId);
      setSessions(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activityId]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D7E34" />}
        contentContainerClassName="p-4 gap-3"
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="time-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-400 mt-3">Sin sesiones todavía</Text>
            <Text className="text-gray-400 text-sm mt-1">Toca + para crear una sesión</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            onPress={() => navigation.navigate('SessionDetail', { sessionId: item.id, activityId })}
          >
            <Text className="text-base font-semibold text-gray-900">{formatDate(item.startsAt)}</Text>
            {item.locationName ? (
              <View className="flex-row items-center mt-1 gap-1">
                <Ionicons name="location-outline" size={14} color="#9ca3af" />
                <Text className="text-sm text-gray-500">{item.locationName}</Text>
              </View>
            ) : null}
            <View className="flex-row mt-2 gap-3">
              {item.capacity ? (
                <Text className="text-xs text-gray-400">Cupo: {item.capacity}</Text>
              ) : null}
              {item.priceCents ? (
                <Text className="text-xs text-primary-500 font-medium">
                  ${item.priceCents.toLocaleString('es-CL')}
                </Text>
              ) : (
                <Text className="text-xs text-accent-500 font-medium">Gratis</Text>
              )}
            </View>
          </Pressable>
        )}
      />

      {/* FAB */}
      <Pressable
        className="absolute bottom-6 right-6 bg-primary-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('SessionCreate', { activityId })}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>
    </View>
  );
}
