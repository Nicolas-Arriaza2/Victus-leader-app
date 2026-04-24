import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, ScrollView, Text, View,
} from 'react-native';
import { activitiesApi } from '../../services/api/activities';
import { enrollmentsApi } from '../../services/api/enrollments';
import { Activity, ActivityDashboard, ActivityEnrollment } from '../../types/api';
import { ActivitiesStackScreenProps } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  trekking: 'Trekking', theater: 'Teatro', dance: 'Danza', fitness: 'Fitness',
  outdoor: 'Outdoor', wellness: 'Bienestar', gastronomy: 'Gastronomía',
  music: 'Música', art: 'Arte', sports: 'Deportes', other: 'Otro',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function ActivityDetailScreen({ route, navigation }: ActivitiesStackScreenProps<'ActivityDetail'>) {
  const { activityId } = route.params;
  const { user } = useAuth();

  const [activity, setActivity]   = useState<Activity | null>(null);
  const [dashboard, setDashboard] = useState<ActivityDashboard | null>(null);
  const [myEnrollments, setMyEnrollments] = useState<ActivityEnrollment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [enrollingId, setEnrollingId]   = useState<string | null>(null);
  const [cancelingId, setCancelingId]   = useState<string | null>(null);

  const isOwn = !!user && !!activity && activity.createdBy?.id === user.id;

  const myInterestIds = new Set((user?.interests ?? []).map((i) => i.interest.id));

  const load = useCallback(async () => {
    try {
      const { data: act } = await activitiesApi.getById(activityId);
      setActivity(act);
      const isActivityOwn = user && act.createdBy?.id === user.id;
      if (isActivityOwn) {
        const { data: dash } = await activitiesApi.dashboard(activityId);
        setDashboard(dash);
      } else {
        const { data: enrs } = await enrollmentsApi.mine();
        setMyEnrollments(enrs);
      }
    } finally {
      setLoading(false);
    }
  }, [activityId, user]);

  useEffect(() => { load(); }, [load]);

  const enroll = useCallback(async (sessionId: string) => {
    setEnrollingId(sessionId);
    try {
      await enrollmentsApi.enroll(sessionId);
      const { data: enrs } = await enrollmentsApi.mine();
      setMyEnrollments(enrs);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'No se pudo inscribir';
      Alert.alert('Error', msg);
    } finally {
      setEnrollingId(null);
    }
  }, []);

  const confirmCancel = useCallback((enrollmentId: string, sessionId: string) => {
    Alert.alert(
      '¿Desinscribirse?',
      'Biktus no se hace responsable de las devoluciones. Eso se coordina directamente con el líder de la actividad.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desinscribirme',
          style: 'destructive',
          onPress: async () => {
            setCancelingId(sessionId);
            try {
              await enrollmentsApi.cancel(enrollmentId);
              const { data: enrs } = await enrollmentsApi.mine();
              setMyEnrollments(enrs);
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message ?? 'No se pudo desinscribir');
            } finally {
              setCancelingId(null);
            }
          },
        },
      ],
    );
  }, []);

  if (loading || !activity) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  const formatCLP = (cents: number) => `$${Math.round(cents).toLocaleString('es-CL')}`;
  const commonInterests = activity.interests.filter((ai) => myInterestIds.has(ai.interest.id));
  const compatPct = activity.interests.length > 0
    ? Math.round((commonInterests.length / activity.interests.length) * 100)
    : 0;

  const now = new Date();
  const upcomingSessions = (activity.sessions ?? []).filter((s) => new Date(s.startsAt) > now);
  // Map sessionId → enrollmentId so we can cancel by enrollment ID
  const enrollmentBySession = new Map(myEnrollments.map((e) => [e.sessionId, e.id]));

  return (
    <ScrollView className="flex-1 bg-cream">
      {/* Header card */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 flex-wrap">
              <Text className="text-xl font-bold text-gray-900">{activity.title}</Text>
              {isOwn && (
                <View className="bg-primary-100 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                  <Ionicons name="shield-checkmark-outline" size={12} color="#2D7E34" />
                  <Text className="text-xs font-medium text-primary-700">Tu actividad</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-primary-500 mt-0.5">
              {ACTIVITY_TYPE_LABELS[activity.type] ?? activity.type}
            </Text>
          </View>
          {isOwn && (
            <Pressable
              className="ml-3 p-2"
              onPress={() => navigation.navigate('ActivityEdit', { activityId })}
            >
              <Ionicons name="pencil-outline" size={20} color="#2D7E34" />
            </Pressable>
          )}
        </View>

        {activity.description ? (
          <Text className="text-sm text-gray-500 mt-2">{activity.description}</Text>
        ) : null}

        <View className="flex-row flex-wrap gap-2 mt-3">
          {activity.interests.map(({ interest }) => (
            <View
              key={interest.id}
              className={`px-2 py-0.5 rounded-full ${myInterestIds.has(interest.id) ? 'bg-primary-100' : 'bg-primary-50'}`}
            >
              <Text className={`text-xs ${myInterestIds.has(interest.id) ? 'text-primary-700 font-semibold' : 'text-primary-600'}`}>
                {interest.name}
              </Text>
            </View>
          ))}
        </View>

        {activity.pricingModel === 'monthly_subscription' && (
          <View className="mt-3">
            <View className="bg-accent-50 px-3 py-1 rounded-full self-start">
              <Text className="text-xs font-medium text-accent-500">
                Suscripción mensual — ${activity.monthlyPriceCents!.toLocaleString('es-CL')}/mes
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ── OWN ACTIVITY: admin panel ── */}
      {isOwn && (
        <>
          {dashboard && (
            <View className="mx-4 mt-4 flex-row gap-3">
              {[
                { label: 'Inscritos', value: dashboard.totalEnrollmentsAllSessions },
                { label: 'Matches',   value: dashboard.totalMatchesAllSessions },
                { label: 'Revenue',   value: formatCLP(dashboard.totalRevenueCents) },
              ].map((s) => (
                <View key={s.label} className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 items-center">
                  <Text className="text-xl font-bold text-primary-500">{s.value}</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          <Pressable
            className="bg-primary-500 mx-4 mt-4 rounded-2xl p-4 flex-row items-center justify-between"
            onPress={() => navigation.navigate('SessionList', { activityId, activityTitle: activity.title })}
          >
            <Text className="text-white font-semibold text-base">Ver Sesiones</Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </Pressable>

          {activity.pricingModel === 'monthly_subscription' && (
            <Pressable
              className="bg-secondary-500 mx-4 mt-3 rounded-2xl p-4 flex-row items-center justify-between"
              onPress={() => navigation.navigate('Subscribers', { activityId, activityTitle: activity.title })}
            >
              <Text className="text-white font-semibold text-base">Ver Suscriptores</Text>
              <Ionicons name="people-outline" size={20} color="white" />
            </Pressable>
          )}

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
        </>
      )}

      {/* ── OTHER ACTIVITY: compatibility + sessions to enroll ── */}
      {!isOwn && (
        <>
          {/* Compatibility card */}
          <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="sparkles-outline" size={18} color="#7c3aed" />
              <Text className="text-base font-bold text-gray-900">Compatibilidad</Text>
            </View>

            {activity.interests.length === 0 ? (
              <Text className="text-sm text-gray-400">Esta actividad no tiene intereses definidos.</Text>
            ) : commonInterests.length === 0 ? (
              <Text className="text-sm text-gray-500">No compartes intereses con esta actividad todavía.</Text>
            ) : (
              <>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-gray-500">
                    {commonInterests.length} de {activity.interests.length} intereses en común
                  </Text>
                  <Text className="text-xs font-bold text-violet-600">{compatPct}%</Text>
                </View>
                <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <View className="h-2.5 rounded-full bg-violet-500" style={{ width: `${compatPct}%` }} />
                </View>
                <View className="flex-row flex-wrap gap-1">
                  {commonInterests.map(({ interest }) => (
                    <View key={interest.id} className="bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                      <Text className="text-xs text-violet-700 font-medium">{interest.name}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Upcoming sessions */}
          {upcomingSessions.length === 0 ? (
            <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 items-center py-6">
              <Ionicons name="calendar-outline" size={32} color="#9ca3af" />
              <Text className="text-gray-400 mt-2 text-sm">Sin próximas sesiones disponibles</Text>
            </View>
          ) : (
            <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center gap-2 mb-3">
                <Ionicons name="calendar-outline" size={18} color="#2D7E34" />
                <Text className="text-base font-bold text-gray-900">Próximas sesiones</Text>
              </View>
              {upcomingSessions.map((session) => {
                const enrollmentId = enrollmentBySession.get(session.id);
                const enrolled = !!enrollmentId;
                const isCanceling = cancelingId === session.id;
                return (
                  <View
                    key={session.id}
                    className="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0"
                  >
                    <Text className="text-sm font-semibold text-gray-800 mb-0.5">
                      {formatDate(session.startsAt)}
                    </Text>
                    {session.locationName ? (
                      <View className="flex-row items-center gap-1 mb-1.5">
                        <Ionicons name="location-outline" size={12} color="#9ca3af" />
                        <Text className="text-xs text-gray-400">{session.locationName}</Text>
                      </View>
                    ) : null}
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-gray-600">
                        {session.priceCents ? `$${session.priceCents.toLocaleString('es-CL')}` : 'Gratis'}
                      </Text>
                      {enrolled ? (
                        <Pressable
                          className="flex-row items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-xl"
                          onPress={() => confirmCancel(enrollmentId!, session.id)}
                          disabled={isCanceling}
                        >
                          {isCanceling
                            ? <ActivityIndicator size="small" color="#2D7E34" />
                            : <Ionicons name="checkmark-circle" size={15} color="#2D7E34" />}
                          <Text className="text-xs font-semibold text-primary-600">Inscrito</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          className="bg-primary-500 px-4 py-1.5 rounded-xl"
                          onPress={() => enroll(session.id)}
                          disabled={enrollingId === session.id}
                        >
                          <Text className="text-white text-xs font-semibold">
                            {enrollingId === session.id ? 'Inscribiendo...' : 'Inscribirse'}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Forum for non-own activities too */}
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
        </>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
