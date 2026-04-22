import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LeaderStats, usersApi } from '../../services/api/users';

function formatCLP(n: number) {
  return `$${n.toLocaleString('es-CL')}`;
}

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  trekking: 'Trekking',
  theater: 'Teatro',
  dance: 'Danza',
  fitness: 'Fitness',
  outdoor: 'Outdoor',
  wellness: 'Bienestar',
  gastronomy: 'Gastronomía',
  music: 'Música',
  art: 'Arte',
  sports: 'Deporte',
  other: 'Otro',
};

// ── Reusable sub-components ────────────────────────────────────────────────────

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <View className="flex-row items-center gap-2 mb-4">
      <Ionicons name={icon as any} size={18} color="#2D7E34" />
      <Text className="text-base font-bold text-gray-900">{label}</Text>
    </View>
  );
}

function StatCard({
  icon, iconBg, label, value, sub,
}: {
  icon: string; iconBg: string; label: string; value: string; sub?: string;
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon as any} size={18} color="#2D7E34" />
      </View>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      <Text className="text-xs text-gray-500 mt-0.5">{label}</Text>
      {sub ? <Text className="text-xs text-primary-500 font-medium mt-1">{sub}</Text> : null}
    </View>
  );
}

function BarRow({
  label, sub, value, max, color,
}: {
  label: string; sub?: string; value: number; max: number; color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-baseline mb-1">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>{label}</Text>
          {sub ? <Text className="text-xs text-gray-400">{sub}</Text> : null}
        </View>
        <Text className="text-sm font-bold text-gray-700">{value}</Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View
          className="h-2 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export function StatsScreen() {
  const [stats, setStats] = useState<LeaderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await usersApi.leaderStats();
      setStats(data);
    } catch {
      /* swallow — show empty state */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-8">
        <Ionicons name="bar-chart-outline" size={56} color="#9ca3af" />
        <Text className="text-gray-500 text-lg font-semibold mt-4 text-center">
          Sin datos aún
        </Text>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          Crea actividades e inscripciones para ver tus estadísticas.
        </Text>
      </View>
    );
  }

  const { activities, enrollments, revenue, social, topActivities } = stats;
  const maxEnroll  = Math.max(...topActivities.map((a) => a.enrollmentCount), 1);
  const maxRevenue = Math.max(...topActivities.map((a) => a.revenue), 1);
  const maxCompat  = Math.max(...topActivities.map((a) => a.compatibility), 1);
  const sortedByCompat = [...topActivities].sort((a, b) => b.compatibility - a.compatibility);

  // Enrollment donut-style ring values
  const confirmedPct = enrollments.total > 0
    ? Math.round((enrollments.confirmed / enrollments.total) * 100)
    : 0;

  return (
    <ScrollView
      className="flex-1 bg-cream"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D7E34" />}
      contentContainerClassName="px-4 pt-4 pb-10 gap-4"
    >
      {/* ── Hero revenue card ── */}
      <View className="bg-primary-500 rounded-2xl p-6">
        <Text className="text-primary-100 text-sm font-medium">Ingresos totales</Text>
        <Text className="text-white text-4xl font-bold mt-1">
          {formatCLP(revenue.total)}
        </Text>
        <Text className="text-primary-200 text-xs mt-1">CLP acumulado</Text>

        <View className="flex-row mt-5 gap-4">
          <View className="flex-1">
            <View className="flex-row items-center gap-1 mb-0.5">
              <View className="w-2 h-2 rounded-full bg-yellow-300" />
              <Text className="text-primary-100 text-xs">Pendiente</Text>
            </View>
            <Text className="text-white font-semibold text-base">
              {formatCLP(revenue.pending)}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1 mb-0.5">
              <View className="w-2 h-2 rounded-full bg-green-300" />
              <Text className="text-primary-100 text-xs">Transferido</Text>
            </View>
            <Text className="text-white font-semibold text-base">
              {formatCLP(revenue.transferred)}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1 mb-0.5">
              <View className="w-2 h-2 rounded-full bg-blue-300" />
              <Text className="text-primary-100 text-xs">Últimos 30d</Text>
            </View>
            <Text className="text-white font-semibold text-base">
              {formatCLP(revenue.last30days)}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Activity + Session cards ── */}
      <View className="flex-row gap-3">
        <StatCard
          icon="layers-outline"
          iconBg="#dcfce7"
          label="Actividades"
          value={String(activities.total)}
          sub={`${activities.sessions} sesiones`}
        />
        <StatCard
          icon="calendar-outline"
          iconBg="#dbeafe"
          label="Próximas sesiones"
          value={String(activities.upcoming)}
          sub="por venir"
        />
      </View>

      {/* ── Enrollments card ── */}
      <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <SectionTitle icon="people-outline" label="Inscripciones" />

        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-primary-50 rounded-xl p-3 items-center">
            <Text className="text-2xl font-bold text-primary-600">{enrollments.total}</Text>
            <Text className="text-xs text-gray-500 mt-0.5 text-center">Total</Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
            <Text className="text-2xl font-bold text-green-600">{enrollments.confirmed}</Text>
            <Text className="text-xs text-gray-500 mt-0.5 text-center">Confirmados</Text>
          </View>
          <View className="flex-1 bg-orange-50 rounded-xl p-3 items-center">
            <Text className="text-2xl font-bold text-orange-500">{enrollments.pending}</Text>
            <Text className="text-xs text-gray-500 mt-0.5 text-center">Pendientes</Text>
          </View>
          <View className="flex-1 bg-purple-50 rounded-xl p-3 items-center">
            <Text className="text-2xl font-bold text-purple-500">{enrollments.uniqueParticipants}</Text>
            <Text className="text-xs text-gray-500 mt-0.5 text-center">Personas</Text>
          </View>
        </View>

        {/* Confirmation rate bar */}
        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-gray-500">Tasa de confirmación</Text>
            <Text className="text-xs font-bold text-primary-600">{confirmedPct}%</Text>
          </View>
          <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-3 rounded-full bg-primary-400"
              style={{ width: `${confirmedPct}%` }}
            />
          </View>
        </View>

        <View className="flex-row mt-4 gap-2">
          <View className="flex-1 flex-row items-center gap-1.5 bg-cream rounded-xl px-3 py-2">
            <Ionicons name="trending-up-outline" size={14} color="#2D7E34" />
            <Text className="text-xs text-gray-600">
              <Text className="font-bold text-primary-600">{enrollments.last7days}</Text> esta semana
            </Text>
          </View>
          <View className="flex-1 flex-row items-center gap-1.5 bg-cream rounded-xl px-3 py-2">
            <Ionicons name="calendar-outline" size={14} color="#2D7E34" />
            <Text className="text-xs text-gray-600">
              <Text className="font-bold text-primary-600">{enrollments.last30days}</Text> este mes
            </Text>
          </View>
        </View>
      </View>

      {/* ── Social: likes recibidos ── */}
      <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <SectionTitle icon="heart-outline" label="Personas que te dieron Like" />

        {social.totalLikes === 0 ? (
          <Text className="text-sm text-gray-400 text-center py-2">
            Aún no has recibido likes en tus sesiones.
          </Text>
        ) : (
          <>
            <View className="items-center mb-5">
              <Text className="text-5xl font-bold text-gray-900">{social.totalLikes}</Text>
              <Text className="text-sm text-gray-400 mt-1">likes recibidos</Text>
            </View>

            {/* Participantes inscritos */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center mb-1.5">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-primary-500" />
                  <Text className="text-sm font-medium text-gray-700">Participantes inscritos</Text>
                </View>
                <Text className="text-sm font-bold text-primary-600">{social.likesFromParticipants}</Text>
              </View>
              <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-2.5 rounded-full bg-primary-500"
                  style={{ width: `${social.totalLikes > 0 ? (social.likesFromParticipants / social.totalLikes) * 100 : 0}%` }}
                />
              </View>
              <Text className="text-xs text-gray-400 mt-1">
                Personas ya inscritas en tus actividades
              </Text>
            </View>

            {/* Prospectos */}
            <View>
              <View className="flex-row justify-between items-center mb-1.5">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-violet-500" />
                  <Text className="text-sm font-medium text-gray-700">Potenciales participantes</Text>
                </View>
                <Text className="text-sm font-bold text-violet-600">{social.likesFromProspects}</Text>
              </View>
              <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-2.5 rounded-full bg-violet-500"
                  style={{ width: `${social.totalLikes > 0 ? (social.likesFromProspects / social.totalLikes) * 100 : 0}%` }}
                />
              </View>
              <Text className="text-xs text-gray-400 mt-1">
                Personas con intereses afines que aún no se han inscrito
              </Text>
            </View>
          </>
        )}
      </View>

      {/* ── Top activities by enrollment ── */}
      {topActivities.length > 0 && (
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle icon="podium-outline" label="Actividades más populares" />
          {topActivities.map((a) => (
            <BarRow
              key={a.id}
              label={a.title}
              sub={ACTIVITY_TYPE_LABELS[a.type] ?? a.type}
              value={a.enrollmentCount}
              max={maxEnroll}
              color="#2D7E34"
            />
          ))}
        </View>
      )}

      {/* ── Top activities by revenue ── */}
      {topActivities.some((a) => a.revenue > 0) && (
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle icon="cash-outline" label="Ingresos por actividad" />
          {topActivities
            .filter((a) => a.revenue > 0)
            .sort((a, b) => b.revenue - a.revenue)
            .map((a) => (
              <BarRow
                key={a.id}
                label={a.title}
                sub={formatCLP(a.revenue)}
                value={a.revenue}
                max={maxRevenue}
                color="#2764AD"
              />
            ))}
        </View>
      )}

      {/* ── Activity compatibility ── */}
      {sortedByCompat.some((a) => a.compatibility > 0) && (
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle icon="sparkles-outline" label="Actividades más afines contigo" />
          <Text className="text-xs text-gray-400 mb-4 -mt-2">
            Basado en los likes que recibiste dentro de cada actividad
          </Text>
          {sortedByCompat.map((a) => (
            <BarRow
              key={a.id}
              label={a.title}
              sub={`${a.compatibility} ${a.compatibility === 1 ? 'like' : 'likes'} en sesiones`}
              value={a.compatibility}
              max={maxCompat}
              color="#7c3aed"
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
