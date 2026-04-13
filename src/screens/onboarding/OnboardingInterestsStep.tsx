import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { interestsApi } from '../../services/api/interests';
import { usersApi } from '../../services/api/users';
import { useAuth } from '../../hooks/useAuth';
import { Interest } from '../../types/api';
import { OnboardingStackScreenProps } from '../../navigation/types';
import { ProgressBar } from './ProgressBar';

// ─── Interest categories ──────────────────────────────────────────────────────

const INTEREST_CATEGORIES: { label: string; slugs: string[] }[] = [
  { label: '💃 Baile',               slugs: ['salsa', 'bachata', 'tango', 'reggaeton', 'folclore'] },
  { label: '🏔️ Deporte & Naturaleza', slugs: ['trekking', 'senderismo', 'escalada', 'ciclismo', 'running', 'surf'] },
  { label: '🎭 Artes & Escena',       slugs: ['teatro', 'comedia', 'fotografia', 'arte', 'cine'] },
  { label: '🎉 Social & Grupal',      slugs: ['juegos-de-mesa', 'asados', 'voluntariado', 'viajes-grupales'] },
  { label: '🧘 Bienestar',            slugs: ['yoga', 'fitness', 'meditacion'] },
  { label: '🍽️ Gastronomía & Música', slugs: ['gastronomia', 'musica'] },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function OnboardingInterestsStep({ navigation }: OnboardingStackScreenProps<'OnboardingInterests'>) {
  const { user } = useAuth();
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [selected, setSelected] = useState<string[]>(
    (user as any)?.interests?.map((ui: any) => ui.interestId ?? ui.interest?.id) ?? [],
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    interestsApi.list()
      .then(({ data }) => setAllInterests(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 10 ? prev : [...prev, id],
    );

  const handleContinue = async () => {
    setSaving(true);
    try {
      if (selected.length > 0) {
        await usersApi.setInterests(selected);
      }
      navigation.navigate('OnboardingSwipe');
    } catch {
      navigation.navigate('OnboardingSwipe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ProgressBar step={3} total={4} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2D7E34" />
        </View>
      </View>
    );
  }

  const allCatSlugs = INTEREST_CATEGORIES.flatMap((c) => c.slugs);
  const uncategorized = allInterests.filter((i) => !allCatSlugs.includes(i.slug));

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ProgressBar step={3} total={4} />

      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 28, gap: 24, paddingBottom: 120 }}>
        {/* Title */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#111', letterSpacing: -0.5 }}>
              Tus intereses
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: selected.length >= 10 ? '#ef4444' : '#2D7E34' }}>
              {selected.length}/10
            </Text>
          </View>
          <Text style={{ fontSize: 15, color: '#6b7280', marginTop: 8, lineHeight: 22 }}>
            Elegí hasta 10. Aparecerán en tu perfil y te conectarán con personas afines.
          </Text>
        </View>

        {/* Categories */}
        {INTEREST_CATEGORIES.map((cat) => {
          const catInterests = allInterests.filter((i) => cat.slugs.includes(i.slug));
          if (catInterests.length === 0) return null;
          return (
            <View key={cat.label} style={{ gap: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>{cat.label}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {catInterests.map((interest) => {
                  const active = selected.includes(interest.id);
                  const disabled = !active && selected.length >= 10;
                  return (
                    <Pressable
                      key={interest.id}
                      onPress={() => !disabled && toggle(interest.id)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 9, borderRadius: 24, borderWidth: 1.5,
                        borderColor: active ? '#2D7E34' : disabled ? '#f3f4f6' : '#e5e7eb',
                        backgroundColor: active ? '#f0fdf4' : disabled ? '#fafafa' : '#fff',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#2D7E34' : disabled ? '#d1d5db' : '#6b7280' }}>
                        {interest.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Uncategorized */}
        {uncategorized.length > 0 && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>Otros</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {uncategorized.map((interest) => {
                const active = selected.includes(interest.id);
                const disabled = !active && selected.length >= 10;
                return (
                  <Pressable
                    key={interest.id}
                    onPress={() => !disabled && toggle(interest.id)}
                    style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 24, borderWidth: 1.5, borderColor: active ? '#2D7E34' : '#e5e7eb', backgroundColor: active ? '#f0fdf4' : '#fff' }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#2D7E34' : '#6b7280' }}>
                      {interest.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky bottom */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#f3f4f6', gap: 12 }}>
        <Pressable
          onPress={handleContinue}
          disabled={saving}
          style={{ backgroundColor: saving ? '#86efac' : '#2D7E34', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            {saving ? 'Guardando...' : selected.length > 0 ? `Continuar con ${selected.length} interés${selected.length > 1 ? 'es' : ''}` : 'Continuar'}
          </Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('OnboardingSwipe')} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: '#9ca3af' }}>Saltar por ahora</Text>
        </Pressable>
      </View>
    </View>
  );
}
