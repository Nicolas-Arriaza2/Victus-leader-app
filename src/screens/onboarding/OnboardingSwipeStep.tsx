import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { storage } from '../../utils/storage';
import { OnboardingStackScreenProps } from '../../navigation/types';
import { ProgressBar } from './ProgressBar';

// ─── Types & Constants ────────────────────────────────────────────────────────

interface SwipeFilters {
  maxDistance: number;
  minAge: number;
  maxAge: number;
  gender: 'all' | 'male' | 'female' | 'non_binary';
}

const DEFAULT_FILTERS: SwipeFilters = {
  maxDistance: 50,
  minAge: 18,
  maxAge: 60,
  gender: 'all',
};

const GENDER_OPTIONS: { value: SwipeFilters['gender']; label: string }[] = [
  { value: 'all',        label: 'Todos' },
  { value: 'female',     label: 'Mujeres' },
  { value: 'male',       label: 'Hombres' },
  { value: 'non_binary', label: 'No binario' },
];

const DISTANCE_OPTIONS = [10, 25, 50, 100, 200];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function OnboardingSwipeStep({ navigation }: OnboardingStackScreenProps<'OnboardingSwipe'>) {
  const { completeOnboarding } = useAuth();
  const [filters, setFilters] = useState<SwipeFilters>(DEFAULT_FILTERS);
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    setSaving(true);
    try {
      await storage.setSwipeFilters(filters);
      await completeOnboarding();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ProgressBar step={4} total={4} />

      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 28, gap: 32, paddingBottom: 120 }}>
        {/* Title */}
        <View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#111', letterSpacing: -0.5 }}>
            Configurá el swipe
          </Text>
          <Text style={{ fontSize: 15, color: '#6b7280', marginTop: 8, lineHeight: 22 }}>
            ¿A quién querés conocer? Podés cambiarlo en cualquier momento.
          </Text>
        </View>

        {/* Show me */}
        <View style={{ gap: 14 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#111' }}>Mostrar</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {GENDER_OPTIONS.map((opt) => {
              const active = filters.gender === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setFilters((f) => ({ ...f, gender: opt.value }))}
                  style={{
                    paddingHorizontal: 20, paddingVertical: 11, borderRadius: 24, borderWidth: 1.5,
                    borderColor: active ? '#2D7E34' : '#e5e7eb',
                    backgroundColor: active ? '#f0fdf4' : '#fff',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: active ? '#2D7E34' : '#6b7280' }}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Age range */}
        <View style={{ gap: 14 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#111' }}>Rango de edad</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Mínima</Text>
              <TextInput
                value={String(filters.minAge)}
                onChangeText={(v) => {
                  const n = parseInt(v, 10);
                  if (!isNaN(n) && n >= 16 && n < filters.maxAge)
                    setFilters((f) => ({ ...f, minAge: n }));
                }}
                keyboardType="number-pad"
                style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, padding: 14, fontSize: 17, textAlign: 'center', color: '#111' }}
              />
            </View>
            <Text style={{ color: '#9ca3af', fontSize: 18, marginTop: 20 }}>—</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Máxima</Text>
              <TextInput
                value={String(filters.maxAge)}
                onChangeText={(v) => {
                  const n = parseInt(v, 10);
                  if (!isNaN(n) && n > filters.minAge && n <= 99)
                    setFilters((f) => ({ ...f, maxAge: n }));
                }}
                keyboardType="number-pad"
                style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, padding: 14, fontSize: 17, textAlign: 'center', color: '#111' }}
              />
            </View>
          </View>
        </View>

        {/* Max distance */}
        <View style={{ gap: 14 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#111' }}>
            Distancia máxima — {filters.maxDistance} km
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {DISTANCE_OPTIONS.map((km) => {
              const active = filters.maxDistance === km;
              return (
                <Pressable
                  key={km}
                  onPress={() => setFilters((f) => ({ ...f, maxDistance: km }))}
                  style={{
                    flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5,
                    borderColor: active ? '#2D7E34' : '#e5e7eb',
                    backgroundColor: active ? '#f0fdf4' : '#fff',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: active ? '#2D7E34' : '#6b7280' }}>
                    {km}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Info box */}
        <View style={{ backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#bbf7d0' }}>
          <Text style={{ fontSize: 13, color: '#166534', lineHeight: 20 }}>
            Estas preferencias se guardan localmente y podés cambiarlas en cualquier momento desde la pantalla de Descubrir.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky bottom */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
        <Pressable
          onPress={handleStart}
          disabled={saving}
          style={{ backgroundColor: saving ? '#86efac' : '#2D7E34', borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>
            {saving ? 'Listo...' : '¡Empezar!'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
