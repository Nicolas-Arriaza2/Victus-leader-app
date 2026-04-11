import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/api/client';
import { ProfileStackScreenProps } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

interface FullProfile {
  id: string;
  username: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    city: string | null;
  } | null;
  photos: { id: string; url: string; position: number }[];
  interests: { interest: { name: string; slug: string } }[];
}

export function ProfilePreviewScreen(_props: ProfileStackScreenProps<'ProfilePreview'>) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<FullProfile>('/users/me')
      .then(({ data }) => setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  const photos = profile?.photos ?? [];
  const mainPhoto = photos.find((p) => p.position === photoIndex) ?? photos[0];
  const imageUri = mainPhoto?.url ?? profile?.profile?.avatarUrl;
  const displayName = profile?.profile?.firstName
    ? `${profile.profile.firstName} ${profile.profile.lastName ?? ''}`.trim()
    : user?.email ?? '';

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      {/* Foto principal */}
      <View style={{ width, height: height * 0.72 }}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-gray-800">
            <Ionicons name="person" size={80} color="#4b5563" />
          </View>
        )}

        {/* Selector de fotos */}
        {photos.length > 1 && (
          <View className="absolute top-3 left-0 right-0 flex-row justify-center gap-1.5">
            {photos.map((p) => (
              <View
                key={p.id}
                style={{
                  height: 3,
                  width: (width - 32 - (photos.length - 1) * 6) / photos.length,
                  borderRadius: 2,
                  backgroundColor: p.position === photoIndex ? 'white' : 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </View>
        )}

        {/* Toque izq/der para cambiar foto */}
        <View className="absolute inset-0 flex-row">
          <View
            style={{ flex: 1 }}
            onTouchEnd={() => setPhotoIndex((i) => Math.max(0, i - 1))}
          />
          <View
            style={{ flex: 1 }}
            onTouchEnd={() => setPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
          />
        </View>

        {/* Gradiente inferior */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 180,
            background: 'transparent',
          }}
          className="bg-gradient-to-t from-black/80 to-transparent"
        />

        {/* Nombre y ciudad */}
        <View className="absolute bottom-4 left-4 right-4">
          <View className="flex-row items-end gap-2">
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '700', lineHeight: 32 }}>
              {displayName}
            </Text>
            {profile?.username ? (
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 2 }}>
                @{profile.username}
              </Text>
            ) : null}
          </View>
          {profile?.profile?.city ? (
            <View className="flex-row items-center gap-1 mt-1">
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                {profile.profile.city}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Info inferior */}
      <ScrollView className="flex-1 bg-white px-4 pt-4">
        {profile?.profile?.bio ? (
          <Text className="text-gray-700 text-base leading-relaxed mb-4">
            {profile.profile.bio}
          </Text>
        ) : null}

        {profile?.interests && profile.interests.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-6">
            {profile.interests.map(({ interest }) => (
              <View key={interest.slug} className="bg-primary-50 border border-primary-100 px-3 py-1 rounded-full">
                <Text className="text-primary-600 text-sm font-medium">{interest.name}</Text>
              </View>
            ))}
          </View>
        )}

        <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <Text className="text-amber-700 text-xs text-center">
            Así es como te verán los participantes en el swipe
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
