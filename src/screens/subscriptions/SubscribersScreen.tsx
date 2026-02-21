import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { subscriptionsApi, ActivitySubscriber } from '../../services/api/subscriptions';
import { ActivitiesStackScreenProps } from '../../navigation/types';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:          { label: 'Activa',            color: 'text-primary-600', bg: 'bg-primary-50' },
  pending_payment: { label: 'Pago pendiente',    color: 'text-amber-700',   bg: 'bg-amber-50' },
  overdue:         { label: 'Vencida',            color: 'text-red-600',     bg: 'bg-red-50' },
  cancelled:       { label: 'Cancelada',          color: 'text-gray-500',    bg: 'bg-gray-100' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function SubscriberRow({ item }: { item: ActivitySubscriber }) {
  const name = item.user.profile?.firstName
    ? `${item.user.profile.firstName} ${item.user.profile.lastName ?? ''}`.trim()
    : item.user.email;

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  const lastBilling = item.billings[0];
  const statusInfo = STATUS_LABELS[item.status] ?? { label: item.status, color: 'text-gray-500', bg: 'bg-gray-100' };

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center gap-3">
        {/* Avatar */}
        <View className="w-11 h-11 rounded-full bg-secondary-100 items-center justify-center">
          <Text className="text-secondary-600 font-bold text-base">{initials}</Text>
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-xs text-gray-400 mt-0.5">{item.user.email}</Text>
        </View>

        {/* Status badge */}
        <View className={`px-2 py-0.5 rounded-full ${statusInfo.bg}`}>
          <Text className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</Text>
        </View>
      </View>

      {/* Last billing */}
      {lastBilling && (
        <View className="mt-3 pt-3 border-t border-gray-100 flex-row justify-between items-center">
          <View className="flex-row items-center gap-1">
            <Ionicons name="receipt-outline" size={13} color="#9ca3af" />
            <Text className="text-xs text-gray-500">
              Último cobro: ${parseInt(lastBilling.totalAmount).toLocaleString('es-CL')}
            </Text>
          </View>
          {lastBilling.paidAt ? (
            <Text className="text-xs text-primary-600">
              Pagado {formatDate(lastBilling.paidAt)}
            </Text>
          ) : (
            <Text className="text-xs text-amber-600">
              Vence {formatDate(lastBilling.dueDate)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export function SubscribersScreen({ route }: ActivitiesStackScreenProps<'Subscribers'>) {
  const { activityId } = route.params;
  const [subscribers, setSubscribers] = useState<ActivitySubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await subscriptionsApi.getActivitySubscribers(activityId);
      setSubscribers(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activityId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-cream"
      data={subscribers}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          tintColor="#2D7E34"
        />
      }
      contentContainerClassName="p-4 gap-3"
      ListHeaderComponent={
        <View className="bg-secondary-50 rounded-2xl px-4 py-3 mb-1 flex-row items-center gap-2">
          <Ionicons name="people" size={16} color="#2764AD" />
          <Text className="text-secondary-700 text-sm font-medium">
            {subscribers.length} suscriptor{subscribers.length !== 1 ? 'es' : ''} activo{subscribers.length !== 1 ? 's' : ''}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View className="items-center justify-center py-16">
          <Ionicons name="people-outline" size={52} color="#d1d5db" />
          <Text className="text-gray-400 mt-3 text-base">Sin suscriptores todavía</Text>
        </View>
      }
      renderItem={({ item }) => <SubscriberRow item={item} />}
    />
  );
}
