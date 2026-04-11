import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SwipeCandidate, swipesApi } from '../../services/api/swipes';
import { SwipeStackScreenProps } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Filters {
  maxDistance: number;
  minAge: number;
  maxAge: number;
  gender: 'all' | 'male' | 'female' | 'non_binary';
}

const DEFAULT_FILTERS: Filters = {
  maxDistance: 50,
  minAge: 18,
  maxAge: 60,
  gender: 'all',
};

const GENDER_OPTIONS: { value: Filters['gender']; label: string }[] = [
  { value: 'all',        label: 'Todos' },
  { value: 'female',     label: 'Mujeres' },
  { value: 'male',       label: 'Hombres' },
  { value: 'non_binary', label: 'No binario' },
];

// ─── SwipeCard ────────────────────────────────────────────────────────────────

function SwipeCard({
  candidate,
  onLike,
  onPass,
  isTop,
}: {
  candidate: SwipeCandidate & { distanceKm?: number | null };
  onLike: () => void;
  onPass: () => void;
  isTop: boolean;
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [photoIndex, setPhotoIndex] = useState(0);

  const photos = candidate.photos ?? [];
  const currentPhoto = photos[photoIndex]?.url ?? candidate.profile?.avatarUrl ?? null;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTop,
      onMoveShouldSetPanResponder: () => isTop,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          Animated.timing(pan, { toValue: { x: SCREEN_WIDTH * 1.5, y: g.dy }, duration: 250, useNativeDriver: false }).start(onLike);
        } else if (g.dx < -SWIPE_THRESHOLD) {
          Animated.timing(pan, { toValue: { x: -SCREEN_WIDTH * 1.5, y: g.dy }, duration: 250, useNativeDriver: false }).start(onPass);
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    }),
  ).current;

  const rotate = pan.x.interpolate({ inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH], outputRange: ['-18deg', '0deg', '18deg'], extrapolate: 'clamp' });
  const likeOpacity = pan.x.interpolate({ inputRange: [0, SWIPE_THRESHOLD * 0.5], outputRange: [0, 1], extrapolate: 'clamp' });
  const passOpacity = pan.x.interpolate({ inputRange: [-SWIPE_THRESHOLD * 0.5, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  const displayName = candidate.profile?.firstName
    ? `${candidate.profile.firstName} ${candidate.profile.lastName ?? ''}`.trim()
    : candidate.username ?? 'Usuario';

  return (
    <Animated.View
      style={[
        { position: 'absolute', width: SCREEN_WIDTH - 32, height: '100%', borderRadius: 20, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
        { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] },
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={() => { if (photos.length > 1) setPhotoIndex((i) => (i + 1) % photos.length); }}
      >
        {currentPhoto ? (
          <Image source={{ uri: currentPhoto }} style={{ flex: 1 }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
            <Ionicons name="person-outline" size={80} color="#9ca3af" />
          </View>
        )}

        {/* Photo dots */}
        {photos.length > 1 && (
          <View style={{ position: 'absolute', top: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
            {photos.map((_, i) => (
              <View key={i} style={{ width: i === photoIndex ? 20 : 6, height: 4, borderRadius: 2, backgroundColor: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.5)' }} />
            ))}
          </View>
        )}

        {/* Like / Pass overlays */}
        <Animated.View style={[{ position: 'absolute', top: 40, left: 20, borderWidth: 3, borderColor: '#22c55e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }, { opacity: likeOpacity }]}>
          <Text style={{ color: '#22c55e', fontWeight: 'bold', fontSize: 24 }}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[{ position: 'absolute', top: 40, right: 20, borderWidth: 3, borderColor: '#ef4444', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }, { opacity: passOpacity }]}>
          <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 24 }}>PASS</Text>
        </Animated.View>

        {/* Info */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 16, padding: 14 }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>{displayName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10 }}>
              {candidate.profile?.city ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{candidate.profile.city}</Text>
                </View>
              ) : null}
              {candidate.distanceKm !== null && candidate.distanceKm !== undefined ? (
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{candidate.distanceKm} km</Text>
              ) : null}
            </View>
            {candidate.profile?.bio ? (
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 6 }} numberOfLines={2}>{candidate.profile.bio}</Text>
            ) : null}
            {candidate.interests.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {candidate.interests.slice(0, 4).map((ui) => (
                  <View key={ui.interest.id} style={{ backgroundColor: 'rgba(45,126,52,0.85)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{ui.interest.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── FilterModal ──────────────────────────────────────────────────────────────

function FilterModal({
  visible,
  filters,
  onApply,
  onClose,
}: {
  visible: boolean;
  filters: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Filters>(filters);

  useEffect(() => { if (visible) setDraft(filters); }, [visible, filters]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
          <Pressable onPress={onClose}>
            <Text style={{ color: '#6b7280', fontSize: 16 }}>Cancelar</Text>
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111' }}>Filtros</Text>
          <Pressable onPress={() => setDraft(DEFAULT_FILTERS)}>
            <Text style={{ color: '#2D7E34', fontSize: 16 }}>Reset</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 28 }}>
          {/* Distance */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 12 }}>
              Distancia máxima — {draft.maxDistance} km
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[10, 25, 50, 100, 200].map((km) => (
                <Pressable
                  key={km}
                  onPress={() => setDraft((d) => ({ ...d, maxDistance: km }))}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: draft.maxDistance === km ? '#2D7E34' : '#e5e7eb', backgroundColor: draft.maxDistance === km ? '#f0fdf4' : '#fff', alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: draft.maxDistance === km ? '#2D7E34' : '#6b7280' }}>{km}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Age range */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 12 }}>Rango de edad</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Mínima</Text>
                <TextInput
                  value={String(draft.minAge)}
                  onChangeText={(v) => {
                    const n = parseInt(v, 10);
                    if (!isNaN(n) && n >= 18 && n < draft.maxAge) setDraft((d) => ({ ...d, minAge: n }));
                  }}
                  keyboardType="number-pad"
                  style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16, textAlign: 'center' }}
                />
              </View>
              <Text style={{ color: '#9ca3af', marginTop: 16 }}>—</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Máxima</Text>
                <TextInput
                  value={String(draft.maxAge)}
                  onChangeText={(v) => {
                    const n = parseInt(v, 10);
                    if (!isNaN(n) && n > draft.minAge && n <= 99) setDraft((d) => ({ ...d, maxAge: n }));
                  }}
                  keyboardType="number-pad"
                  style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16, textAlign: 'center' }}
                />
              </View>
            </View>
          </View>

          {/* Gender */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 12 }}>Mostrar</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {GENDER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setDraft((d) => ({ ...d, gender: opt.value }))}
                  style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, borderColor: draft.gender === opt.value ? '#2D7E34' : '#e5e7eb', backgroundColor: draft.gender === opt.value ? '#f0fdf4' : '#fff' }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: draft.gender === opt.value ? '#2D7E34' : '#6b7280' }}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Apply */}
        <View style={{ padding: 20, paddingBottom: 36 }}>
          <Pressable
            onPress={() => { onApply(draft); onClose(); }}
            style={{ backgroundColor: '#2D7E34', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Aplicar filtros</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── SwipeScreen ──────────────────────────────────────────────────────────────

export function SwipeScreen({ navigation }: SwipeStackScreenProps<'Discover'>) {
  const [candidates, setCandidates] = useState<(SwipeCandidate & { distanceKm?: number | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchAlert, setMatchAlert] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Request location once on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
      } catch {
        // Location not available — proceed without it
      }
    })();
  }, []);

  const load = useCallback(async (f: Filters = filters, loc = location) => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        maxDistance: String(f.maxDistance),
        minAge: String(f.minAge),
        maxAge: String(f.maxAge),
        gender: f.gender,
      };
      if (loc) {
        params.lat = String(loc.lat);
        params.lng = String(loc.lng);
      }
      const { data } = await swipesApi.discover(params);
      setCandidates(data as any);
      setCurrentIndex(0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filters, location]);

  useEffect(() => { load(); }, [load]);

  const applyFilters = (f: Filters) => {
    setFilters(f);
    load(f, location);
  };

  const handleSwipe = async (action: 'LIKE' | 'PASS') => {
    const candidate = candidates[currentIndex];
    if (!candidate) return;
    try {
      const { data } = await swipesApi.swipe(candidate.id, action);
      if (data.match) setMatchAlert(true);
    } catch { /* ignore */ }
    setCurrentIndex((i) => i + 1);
  };

  const visibleCandidates = candidates.slice(currentIndex, currentIndex + 3);
  const activeFilterCount = [
    filters.maxDistance !== DEFAULT_FILTERS.maxDistance,
    filters.minAge !== DEFAULT_FILTERS.minAge || filters.maxAge !== DEFAULT_FILTERS.maxAge,
    filters.gender !== DEFAULT_FILTERS.gender,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <Text className="text-2xl font-bold text-gray-900">Descubrir</Text>
        <View className="flex-row gap-2">
          {/* Filters button */}
          <Pressable
            onPress={() => setShowFilters(true)}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm border border-gray-100"
          >
            <View>
              <Ionicons name="options-outline" size={20} color="#2D7E34" />
              {activeFilterCount > 0 && (
                <View style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: 7, backgroundColor: '#ED6F49', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>{activeFilterCount}</Text>
                </View>
              )}
            </View>
          </Pressable>
          {/* Stats button */}
          <Pressable
            onPress={() => navigation.navigate('CompatibilityStats')}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm border border-gray-100"
          >
            <Ionicons name="stats-chart-outline" size={20} color="#2D7E34" />
          </Pressable>
        </View>
      </View>

      {/* Location chip */}
      {location && (
        <View className="flex-row items-center gap-1 px-5 pb-2">
          <Ionicons name="location" size={12} color="#2D7E34" />
          <Text className="text-xs text-primary-600">Mostrando hasta {filters.maxDistance} km de ti</Text>
        </View>
      )}

      {/* Cards */}
      <View className="flex-1 items-center px-4">
        {visibleCandidates.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="people-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 text-lg font-semibold mt-4 text-center">Sin más personas por ahora</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center px-8">
              Amplía los filtros o agrega más intereses a tu perfil
            </Text>
            <Pressable className="mt-6 bg-primary-500 px-6 py-3 rounded-2xl" onPress={() => load()}>
              <Text className="text-white font-semibold">Actualizar</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
            {[...visibleCandidates].reverse().map((c, reversedIdx) => {
              const idx = visibleCandidates.length - 1 - reversedIdx;
              return (
                <SwipeCard
                  key={c.id}
                  candidate={c}
                  isTop={idx === 0}
                  onLike={() => handleSwipe('LIKE')}
                  onPass={() => handleSwipe('PASS')}
                />
              );
            })}
          </View>
        )}
      </View>

      {/* Action buttons */}
      {visibleCandidates.length > 0 && (
        <View className="flex-row justify-center gap-8 pb-8 pt-4">
          <Pressable className="w-16 h-16 rounded-full bg-white shadow-md border border-gray-100 items-center justify-center" onPress={() => handleSwipe('PASS')}>
            <Ionicons name="close" size={32} color="#ef4444" />
          </Pressable>
          <Pressable className="w-16 h-16 rounded-full bg-primary-500 shadow-md items-center justify-center" onPress={() => handleSwipe('LIKE')}>
            <Ionicons name="heart" size={28} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* Match popup */}
      {matchAlert && (
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => setMatchAlert(false)}
        >
          <View className="bg-white rounded-3xl p-8 mx-8 items-center">
            <Text style={{ fontSize: 48 }}>🎉</Text>
            <Text className="text-2xl font-bold text-gray-900 mt-3">¡Es un match!</Text>
            <Text className="text-gray-500 text-sm mt-2 text-center">Tienen intereses en común</Text>
            <Pressable className="mt-6 bg-primary-500 px-8 py-3 rounded-2xl" onPress={() => setMatchAlert(false)}>
              <Text className="text-white font-semibold">Continuar</Text>
            </Pressable>
          </View>
        </Pressable>
      )}

      {/* Filter modal */}
      <FilterModal
        visible={showFilters}
        filters={filters}
        onApply={applyFilters}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
}
