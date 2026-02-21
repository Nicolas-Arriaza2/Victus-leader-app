import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { sessionsApi } from '../../services/api/sessions';
import { ActivitySession, SessionStats } from '../../types/api';
import { ActivitiesStackScreenProps } from '../../navigation/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });
}

export function SessionDetailScreen({ route, navigation }: ActivitiesStackScreenProps<'SessionDetail'>) {
  const { sessionId, activityId } = route.params;
  const [session, setSession] = useState<ActivitySession | null>(null);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [{ data: s }, { data: st }] = await Promise.all([
        sessionsApi.getById(sessionId),
        sessionsApi.stats(sessionId),
      ]);
      setSession(s);
      setStats(st);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  if (loading || !session) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-cream">
      {/* Info card */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row justify-between items-start">
          <Text className="text-base font-semibold text-gray-900 flex-1">{formatDate(session.startsAt)}</Text>
          <Pressable
            className="ml-2 p-2"
            onPress={() => navigation.navigate('SessionEdit', { sessionId, activityId })}
          >
            <Ionicons name="pencil-outline" size={18} color="#2D7E34" />
          </Pressable>
        </View>
        {session.locationName ? (
          <View className="flex-row items-center mt-2 gap-1">
            <Ionicons name="location-outline" size={14} color="#9ca3af" />
            <Text className="text-sm text-gray-500">{session.locationName}</Text>
          </View>
        ) : null}
        <View className="flex-row mt-3 gap-6">
          <View>
            <Text className="text-xs text-gray-400">Precio</Text>
            <Text className="text-sm font-semibold text-gray-800">
              {session.priceCents
                ? `$${session.priceCents.toLocaleString('es-CL')}`
                : 'Gratis'}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-gray-400">Cupo</Text>
            <Text className="text-sm font-semibold text-gray-800">{session.capacity ?? '∞'}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      {stats && (
        <View className="mx-4 mt-4 flex-row gap-3">
          {[
            { label: 'Inscritos', value: stats.totalEnrollments, color: 'text-primary-500' },
            { label: 'Likes', value: stats.totalLikes, color: 'text-accent-500' },
            { label: 'Matches', value: stats.totalMatches, color: 'text-secondary-500' },
          ].map((s) => (
            <View key={s.label} className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 items-center">
              <Text className={`text-xl font-bold ${s.color}`}>{s.value}</Text>
              <Text className="text-xs text-gray-400 mt-0.5">{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Spotseft indicator */}
      {stats && stats.capacity && (
        <View className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Cupos disponibles</Text>
            <Text className="text-sm font-semibold text-gray-800">
              {stats.spotsLeft ?? 0} / {stats.capacity}
            </Text>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-2 bg-primary-500 rounded-full"
              style={{ width: `${((stats.totalEnrollments / stats.capacity) * 100).toFixed(0)}%` as any }}
            />
          </View>
        </View>
      )}

      {/* Enrollments CTA */}
      <Pressable
        className="bg-primary-500 mx-4 mt-4 rounded-2xl p-4 flex-row items-center justify-between"
        onPress={() => navigation.navigate('Enrollments', { sessionId })}
      >
        <Text className="text-white font-semibold">Ver Inscritos ({stats?.totalEnrollments ?? 0})</Text>
        <Ionicons name="people-outline" size={20} color="white" />
      </Pressable>

      {/* Check-in QR */}
      <Pressable
        className="bg-secondary-500 mx-4 mt-3 rounded-2xl p-4 flex-row items-center justify-between"
        onPress={() => navigation.navigate('CheckIn', { sessionId })}
      >
        <Text className="text-white font-semibold">Escanear QR · Check-in</Text>
        <Ionicons name="qr-code-outline" size={20} color="white" />
      </Pressable>

      <View className="h-8" />
    </ScrollView>
  );
}
