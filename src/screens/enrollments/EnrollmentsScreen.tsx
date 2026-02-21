import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { enrollmentsApi } from '../../services/api/enrollments';
import { ActivityEnrollment } from '../../types/api';
import { ActivitiesStackScreenProps } from '../../navigation/types';

const STATUS_CONFIG: Record<string, { label: string; textColor: string; bg: string }> = {
  pending:   { label: 'Pendiente',  textColor: 'text-warning-600',   bg: 'bg-warning-500/20' },
  confirmed: { label: 'Confirmado', textColor: 'text-secondary-600', bg: 'bg-secondary-50' },
  attended:  { label: 'Asistió',    textColor: 'text-primary-600',   bg: 'bg-primary-50' },
  cancelled: { label: 'Cancelado',  textColor: 'text-gray-500',      bg: 'bg-gray-100' },
};

export function EnrollmentsScreen({ route }: ActivitiesStackScreenProps<'Enrollments'>) {
  const { sessionId } = route.params;
  const [enrollments, setEnrollments] = useState<ActivityEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await enrollmentsApi.listBySession(sessionId);
      setEnrollments(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleStatusChange = async (enrollment: ActivityEnrollment, newStatus: 'confirmed' | 'attended') => {
    try {
      const { data } = await enrollmentsApi.updateStatus(enrollment.id, newStatus);
      setEnrollments((prev) => prev.map((e) => (e.id === data.id ? data : e)));
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado');
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
    <View className="flex-1 bg-cream">
      <FlatList
        data={enrollments}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D7E34" />}
        contentContainerClassName="p-4 gap-3"
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="people-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-400 mt-3">Sin inscritos aún</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
          const displayName = item.user?.profile
            ? `${item.user.profile.firstName ?? ''} ${item.user.profile.lastName ?? ''}`.trim() || item.user.username
            : item.user?.username ?? 'Usuario';

          return (
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-gray-900">{displayName}</Text>
                <View className={`px-2 py-0.5 rounded-full ${cfg.bg}`}>
                  <Text className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</Text>
                </View>
              </View>
              <Text className="text-xs text-gray-400 mt-0.5">
                {item.paymentStatus === 'paid' ? 'Pago confirmado'
                  : item.paymentStatus === 'pending' ? 'Pago pendiente'
                  : item.paymentStatus === 'failed' ? 'Pago fallido'
                  : item.paymentStatus === 'refunded' ? 'Reembolsado'
                  : item.paymentStatus}
              </Text>

              {/* Action buttons */}
              {(item.status === 'pending' || item.status === 'confirmed') && (
                <View className="flex-row gap-2 mt-3">
                  {item.status === 'pending' && (
                    <Pressable
                      className="flex-1 border border-secondary-500 rounded-xl py-2 items-center"
                      onPress={() => handleStatusChange(item, 'confirmed')}
                    >
                      <Text className="text-xs font-semibold text-secondary-500">Confirmar</Text>
                    </Pressable>
                  )}
                  {item.status === 'confirmed' && (
                    <Pressable
                      className="flex-1 bg-primary-500 rounded-xl py-2 items-center"
                      onPress={() => handleStatusChange(item, 'attended')}
                    >
                      <Text className="text-xs font-bold text-white">✓ Marcar Asistencia</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
