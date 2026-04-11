import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { enrollmentsApi } from '../../services/api/enrollments';
import { sessionsApi } from '../../services/api/sessions';
import { ActivityEnrollment } from '../../types/api';
import { ActivitiesStackScreenProps } from '../../navigation/types';

const STATUS_CONFIG: Record<string, { label: string; textColor: string; bg: string }> = {
  pending:   { label: 'Pendiente',  textColor: 'text-warning-600',   bg: 'bg-warning-500/20' },
  confirmed: { label: 'Confirmado', textColor: 'text-secondary-600', bg: 'bg-secondary-50' },
  attended:  { label: 'Asistió',    textColor: 'text-primary-600',   bg: 'bg-primary-50' },
  cancelled: { label: 'Cancelado',  textColor: 'text-gray-500',      bg: 'bg-gray-100' },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  paid:            { label: 'Pagado',          color: '#22c55e' },
  pending_payment: { label: 'Pago pendiente',  color: '#f59e0b' },
  free:            { label: 'Gratis',          color: '#6b7280' },
};

export function EnrollmentsScreen({ route }: ActivitiesStackScreenProps<'Enrollments'>) {
  const { sessionId } = route.params;
  const [enrollments, setEnrollments] = useState<ActivityEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  const handleTogglePayment = async (enrollment: ActivityEnrollment) => {
    const isPaid = enrollment.paymentStatus === 'paid';
    setTogglingId(enrollment.id);
    try {
      const { data } = await enrollmentsApi.markPaid(enrollment.id, !isPaid);
      setEnrollments((prev) => prev.map((e) => (e.id === data.id ? data : e)));
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el pago');
    } finally {
      setTogglingId(null);
    }
  };

  const handlePaymentReminder = async () => {
    const pending = enrollments.filter((e) => e.paymentStatus === 'pending_payment');
    if (pending.length === 0) {
      Alert.alert('Sin pendientes', 'No hay inscritos con pagos pendientes.');
      return;
    }
    Alert.alert(
      'Recordatorio de pago',
      `Se enviará una notificación a ${pending.length} persona${pending.length > 1 ? 's' : ''} con pago pendiente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            setSendingReminder(true);
            try {
              const { data } = await sessionsApi.notifyPaymentReminder(sessionId);
              Alert.alert('Enviado', `Notificación enviada a ${data.notified} persona${data.notified !== 1 ? 's' : ''}.`);
            } catch {
              Alert.alert('Error', 'No se pudo enviar el recordatorio');
            } finally {
              setSendingReminder(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  const pendingPaymentCount = enrollments.filter((e) => e.paymentStatus === 'pending_payment').length;

  return (
    <View className="flex-1 bg-cream">
      {/* Payment reminder banner */}
      {pendingPaymentCount > 0 && (
        <Pressable
          className="mx-4 mt-3 bg-warning-50 border border-warning-200 rounded-2xl px-4 py-3 flex-row items-center justify-between"
          onPress={handlePaymentReminder}
          disabled={sendingReminder}
        >
          <View className="flex-row items-center gap-2 flex-1">
            <Ionicons name="notifications-outline" size={18} color="#d97706" />
            <Text className="text-warning-700 text-sm font-medium flex-1">
              {pendingPaymentCount} pago{pendingPaymentCount > 1 ? 's' : ''} pendiente{pendingPaymentCount > 1 ? 's' : ''}
            </Text>
          </View>
          {sendingReminder ? (
            <ActivityIndicator size="small" color="#d97706" />
          ) : (
            <Text className="text-warning-600 text-xs font-semibold">Recordar</Text>
          )}
        </Pressable>
      )}

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
          const payCfg = PAYMENT_CONFIG[item.paymentStatus] ?? PAYMENT_CONFIG.pending_payment;
          const displayName = item.user?.profile
            ? `${item.user.profile.firstName ?? ''} ${item.user.profile.lastName ?? ''}`.trim() || item.user.username
            : item.user?.username ?? 'Usuario';
          const isPaid = item.paymentStatus === 'paid';
          const hasPricing = item.paymentStatus !== 'free';

          return (
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-gray-900">{displayName}</Text>
                <View className={`px-2 py-0.5 rounded-full ${cfg.bg}`}>
                  <Text className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</Text>
                </View>
              </View>

              {/* Payment status row */}
              <View className="flex-row items-center justify-between mt-2">
                <View className="flex-row items-center gap-1">
                  <View
                    style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: payCfg.color }}
                  />
                  <Text className="text-xs text-gray-500">{payCfg.label}</Text>
                </View>
                {hasPricing && (
                  <Pressable
                    onPress={() => handleTogglePayment(item)}
                    disabled={togglingId === item.id}
                    className={`flex-row items-center gap-1 px-3 py-1 rounded-full border ${
                      isPaid
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {togglingId === item.id ? (
                      <ActivityIndicator size="small" color="#2D7E34" />
                    ) : (
                      <>
                        <Ionicons
                          name={isPaid ? 'checkmark-circle' : 'ellipse-outline'}
                          size={14}
                          color={isPaid ? '#2D7E34' : '#9ca3af'}
                        />
                        <Text className={`text-xs font-semibold ${isPaid ? 'text-primary-600' : 'text-gray-400'}`}>
                          {isPaid ? 'Pagado' : 'Marcar pagado'}
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>

              {/* Attendance buttons */}
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
