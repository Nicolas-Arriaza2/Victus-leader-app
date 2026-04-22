import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { activitiesApi } from '../../services/api/activities';
import { Activity, ActivityDashboard } from '../../types/api';
import { ActivitiesStackScreenProps } from '../../navigation/types';

export function ActivityDetailScreen({ route, navigation }: ActivitiesStackScreenProps<'ActivityDetail'>) {
  const { activityId } = route.params;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [dashboard, setDashboard] = useState<ActivityDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [{ data: act }, { data: dash }] = await Promise.all([
        activitiesApi.getById(activityId),
        activitiesApi.dashboard(activityId),
      ]);
      setActivity(act);
      setDashboard(dash);
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => { load(); }, [load]);

  if (loading || !activity) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  const formatCLP = (cents: number) =>
    `$${Math.round(cents).toLocaleString('es-CL')}`;

  return (
    <ScrollView className="flex-1 bg-cream">
      {/* Header card */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between">
          <Text className="text-xl font-bold text-gray-900 flex-1">{activity.title}</Text>
          <Pressable
            className="ml-3 p-2"
            onPress={() => navigation.navigate('ActivityEdit', { activityId })}
          >
            <Ionicons name="pencil-outline" size={20} color="#2D7E34" />
          </Pressable>
        </View>
        {activity.description ? (
          <Text className="text-sm text-gray-500 mt-2">{activity.description}</Text>
        ) : null}
        {/* Interests */}
        <View className="flex-row flex-wrap gap-2 mt-3">
          {activity.interests.map(({ interest }) => (
            <View key={interest.id} className="bg-primary-50 px-2 py-0.5 rounded-full">
              <Text className="text-xs text-primary-600">{interest.name}</Text>
            </View>
          ))}
        </View>
        {/* Pricing model badge */}
        {activity.pricingModel === 'monthly_subscription' && (
          <View className="mt-3 flex-row items-center gap-1">
            <View className="bg-accent-50 px-3 py-1 rounded-full">
              <Text className="text-xs font-medium text-accent-500">
                Suscripción mensual — ${activity.monthlyPriceCents!.toLocaleString('es-CL')}/mes
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Dashboard stats */}
      {dashboard && (
        <View className="mx-4 mt-4 flex-row gap-3">
          {[
            { label: 'Inscritos', value: dashboard.totalEnrollmentsAllSessions },
            { label: 'Matches', value: dashboard.totalMatchesAllSessions },
            { label: 'Revenue', value: formatCLP(dashboard.totalRevenueCents) },
          ].map((s) => (
            <View key={s.label} className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 items-center">
              <Text className="text-xl font-bold text-primary-500">{s.value}</Text>
              <Text className="text-xs text-gray-400 mt-0.5">{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Sessions button */}
      <Pressable
        className="bg-primary-500 mx-4 mt-4 rounded-2xl p-4 flex-row items-center justify-between"
        onPress={() => navigation.navigate('SessionList', { activityId, activityTitle: activity.title })}
      >
        <Text className="text-white font-semibold text-base">Ver Sesiones</Text>
        <Ionicons name="chevron-forward" size={20} color="white" />
      </Pressable>

      {/* Subscribers button (only for monthly subscription activities) */}
      {activity.pricingModel === 'monthly_subscription' && (
        <Pressable
          className="bg-secondary-500 mx-4 mt-3 rounded-2xl p-4 flex-row items-center justify-between"
          onPress={() => navigation.navigate('Subscribers', { activityId, activityTitle: activity.title })}
        >
          <Text className="text-white font-semibold text-base">Ver Suscriptores</Text>
          <Ionicons name="people-outline" size={20} color="white" />
        </Pressable>
      )}

      {/* Forum button */}
      <Pressable
        className="bg-white border border-gray-200 mx-4 mt-3 rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
        onPress={() => navigation.navigate('Forum', { activityId, activityTitle: activity.title })}
      >
        <View className="flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-xl bg-primary-50 items-center justify-center">
            <Ionicons name="chatbubbles-outline" size={18} color="#2D7E34" />
          </View>
          <Text className="text-gray-800 font-semibold text-base">Foro de preguntas</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
      </Pressable>

      <View className="h-8" />
    </ScrollView>
  );
}
