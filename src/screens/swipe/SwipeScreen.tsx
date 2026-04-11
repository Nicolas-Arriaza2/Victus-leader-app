import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SwipeCandidate, swipesApi } from '../../services/api/swipes';
import { SwipeStackScreenProps } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;

function SwipeCard({
  candidate,
  onLike,
  onPass,
  isTop,
}: {
  candidate: SwipeCandidate;
  onLike: () => void;
  onPass: () => void;
  isTop: boolean;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  const photos = candidate.photos ?? [];
  const currentPhoto = photos[photoIndex]?.url ?? candidate.profile?.avatarUrl ?? null;

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 250 }, () => {
          runOnJS(onLike)();
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 250 }, () => {
          runOnJS(onPass)();
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-20, 0, 20]);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD * 0.5], [0, 1], 'clamp'),
  }));

  const passOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD * 0.5, 0], [1, 0], 'clamp'),
  }));

  const displayName = candidate.profile?.firstName
    ? `${candidate.profile.firstName} ${candidate.profile.lastName ?? ''}`.trim()
    : candidate.username ?? 'Usuario';

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: SCREEN_WIDTH - 32,
            height: '100%',
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          },
          cardStyle,
        ]}
      >
        {/* Photo */}
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            if (photos.length > 1) {
              setPhotoIndex((i) => (i + 1) % photos.length);
            }
          }}
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
                <View
                  key={i}
                  style={{
                    width: i === photoIndex ? 20 : 6,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </View>
          )}

          {/* Like overlay */}
          <Animated.View
            style={[
              { position: 'absolute', top: 40, left: 20, borderWidth: 3, borderColor: '#22c55e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
              likeOpacity,
            ]}
          >
            <Text style={{ color: '#22c55e', fontWeight: 'bold', fontSize: 24 }}>LIKE</Text>
          </Animated.View>

          {/* Pass overlay */}
          <Animated.View
            style={[
              { position: 'absolute', top: 40, right: 20, borderWidth: 3, borderColor: '#ef4444', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
              passOpacity,
            ]}
          >
            <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 24 }}>PASS</Text>
          </Animated.View>

          {/* Bottom info */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 16,
              background: 'transparent',
            }}
          >
            <View style={{ backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 16, padding: 14 }}>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>{displayName}</Text>
              {candidate.profile?.city ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginLeft: 2 }}>
                    {candidate.profile.city}
                  </Text>
                </View>
              ) : null}
              {candidate.profile?.bio ? (
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 6 }} numberOfLines={2}>
                  {candidate.profile.bio}
                </Text>
              ) : null}
              {candidate.interests.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {candidate.interests.slice(0, 4).map((ui) => (
                    <View
                      key={ui.interest.id}
                      style={{ backgroundColor: 'rgba(45,126,52,0.85)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}
                    >
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{ui.interest.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export function SwipeScreen({ navigation }: SwipeStackScreenProps<'Discover'>) {
  const [candidates, setCandidates] = useState<SwipeCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchAlert, setMatchAlert] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await swipesApi.discover();
      setCandidates(data);
      setCurrentIndex(0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSwipe = async (action: 'LIKE' | 'PASS') => {
    const candidate = candidates[currentIndex];
    if (!candidate) return;

    try {
      const { data } = await swipesApi.swipe(candidate.id, action);
      if (data.match) setMatchAlert(true);
    } catch {
      // ignore
    }
    setCurrentIndex((i) => i + 1);
  };

  const visibleCandidates = candidates.slice(currentIndex, currentIndex + 3);

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
        <Pressable
          onPress={() => navigation.navigate('CompatibilityStats')}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm border border-gray-100"
        >
          <Ionicons name="stats-chart-outline" size={20} color="#2D7E34" />
        </Pressable>
      </View>

      {/* Cards */}
      <View className="flex-1 items-center px-4">
        {visibleCandidates.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="people-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 text-lg font-semibold mt-4">Sin más personas por ahora</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center px-8">
              Agrega más intereses a tu perfil para encontrar más personas
            </Text>
            <Pressable
              className="mt-6 bg-primary-500 px-6 py-3 rounded-2xl"
              onPress={load}
            >
              <Text className="text-white font-semibold">Actualizar</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
            {[...visibleCandidates].reverse().map((c, reversedIdx) => {
              const idx = visibleCandidates.length - 1 - reversedIdx;
              const isTop = idx === 0;
              return (
                <SwipeCard
                  key={c.id}
                  candidate={c}
                  isTop={isTop}
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
          <Pressable
            className="w-16 h-16 rounded-full bg-white shadow-md border border-gray-100 items-center justify-center"
            onPress={() => handleSwipe('PASS')}
          >
            <Ionicons name="close" size={32} color="#ef4444" />
          </Pressable>
          <Pressable
            className="w-16 h-16 rounded-full bg-primary-500 shadow-md items-center justify-center"
            onPress={() => handleSwipe('LIKE')}
          >
            <Ionicons name="heart" size={28} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* Match alert */}
      {matchAlert && (
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => setMatchAlert(false)}
        >
          <View className="bg-white rounded-3xl p-8 mx-8 items-center">
            <Text style={{ fontSize: 48 }}>🎉</Text>
            <Text className="text-2xl font-bold text-gray-900 mt-3">¡Es un match!</Text>
            <Text className="text-gray-500 text-sm mt-2 text-center">
              Tienen intereses en común
            </Text>
            <Pressable
              className="mt-6 bg-primary-500 px-8 py-3 rounded-2xl"
              onPress={() => setMatchAlert(false)}
            >
              <Text className="text-white font-semibold">Continuar</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </View>
  );
}
