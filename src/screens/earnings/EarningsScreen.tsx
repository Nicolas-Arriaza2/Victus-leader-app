import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { paymentsApi } from '../../services/api/payments';
import { LeaderEarnings, TransferSchedule } from '../../types/api';
import { EarningsStackScreenProps } from '../../navigation/types';

function formatCLP(amount: string | number | null | undefined) {
  const n = parseFloat(String(amount ?? 0));
  return `$${(isNaN(n) ? 0 : n).toLocaleString('es-CL')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function EarningsScreen(_props: EarningsStackScreenProps<'Earnings'>) {
  const [earnings, setEarnings] = useState<LeaderEarnings | null>(null);
  const [schedule, setSchedule] = useState<TransferSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [{ data: e }, { data: s }] = await Promise.all([
        paymentsApi.myEarnings(),
        paymentsApi.transferSchedule(),
      ]);
      setEarnings(e);
      setSchedule(s);
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

  return (
    <ScrollView
      className="flex-1 bg-cream"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D7E34" />}
    >
      <View className="mx-4 mt-4 gap-3">
        {/* Hero card */}
        {earnings && (
          <>
            <View className="bg-primary-500 rounded-2xl p-6">
              <Text className="text-primary-100 text-sm font-medium">Ganancias Totales</Text>
              <Text className="text-white text-4xl font-bold mt-1">
                {formatCLP(earnings.totalEarnings)}
              </Text>
              <Text className="text-primary-200 text-xs mt-2">CLP · Comisión 10% descontada</Text>
            </View>

            {/* Sub cards */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <Ionicons name="time-outline" size={18} color="#FFEB3C" />
                <Text className="text-xs text-gray-400 mt-2">Pendiente</Text>
                <Text className="text-lg font-bold text-gray-900 mt-0.5">
                  {formatCLP(earnings.pendingTransfers)}
                </Text>
              </View>
              <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <Ionicons name="checkmark-circle-outline" size={18} color="#2D7E34" />
                <Text className="text-xs text-gray-400 mt-2">Transferido</Text>
                <Text className="text-lg font-bold text-gray-900 mt-0.5">
                  {formatCLP(earnings.completedTransfers)}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Next transfer date */}
        {schedule && (
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-secondary-50 items-center justify-center">
              <Ionicons name="calendar-outline" size={20} color="#2764AD" />
            </View>
            <View>
              <Text className="text-xs text-gray-400">Próxima transferencia</Text>
              <Text className="text-sm font-semibold text-gray-800">{formatDate(schedule.nextTransferDate)}</Text>
            </View>
          </View>
        )}

        {/* Payment history */}
        {earnings && earnings.payments.length > 0 && (
          <View className="mt-1">
            <Text className="text-sm font-semibold text-gray-700 mb-3 px-1">Historial de Pagos</Text>
            <View className="gap-2">
              {earnings.payments.map((payment) => (
                <View key={payment.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <Text className="text-sm font-semibold text-gray-800">
                    {payment.enrollment.session.activity.title}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {formatDate(payment.enrollment.session.startsAt)}
                  </Text>
                  <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-50">
                    <Text className="text-xs text-gray-400">Tu parte (90%)</Text>
                    <Text className="text-base font-bold text-primary-500">
                      {formatCLP(payment.leaderAmount)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
