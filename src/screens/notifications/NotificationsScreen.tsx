import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { notificationsApi } from '../../services/api/notifications';
import { useNotificationBadge } from '../../context/NotificationBadgeContext';
import { Notification } from '../../types/api';
import { NotificationsStackScreenProps } from '../../navigation/types';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function NotificationsScreen(_props: NotificationsStackScreenProps<'Notifications'>) {
  const { fetchUnread } = useNotificationBadge();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await notificationsApi.mine();
      setNotifications(data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      fetchUnread();
    } catch {
      // silent
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
    <FlatList
      className="flex-1 bg-cream"
      data={notifications}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D7E34" />}
      contentContainerClassName="p-4 gap-2"
      ListEmptyComponent={
        <View className="items-center justify-center py-20">
          <Ionicons name={error ? 'alert-circle-outline' : 'notifications-outline'} size={48} color="#9ca3af" />
          <Text className="text-gray-400 mt-3">{error ?? 'Sin notificaciones'}</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          className={`rounded-2xl p-4 shadow-sm border ${
            item.isRead ? 'bg-white border-gray-100' : 'bg-primary-50 border-primary-100'
          }`}
          onPress={() => !item.isRead && markRead(item.id)}
        >
          <View className="flex-row items-start">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900">{item.title}</Text>
              <Text className="text-sm text-gray-500 mt-0.5">{item.body}</Text>
            </View>
            <Text className="text-xs text-gray-400 ml-2 mt-0.5">{timeAgo(item.createdAt)}</Text>
          </View>
          {!item.isRead && (
            <View className="absolute top-4 right-4 w-2 h-2 bg-primary-500 rounded-full" />
          )}
        </Pressable>
      )}
    />
  );
}
