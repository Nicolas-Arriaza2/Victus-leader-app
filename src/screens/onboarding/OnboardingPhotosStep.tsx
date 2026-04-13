import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import apiClient from '../../services/api/client';
import { usersApi } from '../../services/api/users';
import { UserPhoto } from '../../types/api';
import { OnboardingStackScreenProps } from '../../navigation/types';
import { ProgressBar } from './ProgressBar';

const { width } = Dimensions.get('window');
const SLOT_SIZE = (width - 48 - 16) / 3;
const MAX_PHOTOS = 3;

export function OnboardingPhotosStep({ navigation }: OnboardingStackScreenProps<'OnboardingPhotos'>) {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    usersApi.myPhotos()
      .then(({ data }) => setPhotos(data))
      .catch(() => {});
  }, []);

  const handlePickAndUpload = async (slotIndex: number) => {
    if (photos.length >= MAX_PHOTOS) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para subir fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const filename = uri.split('/').pop() ?? 'photo.jpg';
    const mimeType = asset.mimeType ?? 'image/jpeg';

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', { uri, name: filename, type: mimeType } as any);
      await apiClient.post('/users/me/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data } = await usersApi.myPhotos();
      setPhotos(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al subir la foto';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (photo: UserPhoto) => {
    Alert.alert('Eliminar foto', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await usersApi.deletePhoto(photo.position);
            const { data } = await usersApi.myPhotos();
            setPhotos(data);
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la foto.');
          }
        },
      },
    ]);
  };

  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => ({
    index: i,
    photo: photos.find((p) => p.position === i) ?? null,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ProgressBar step={1} total={4} />

      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Title */}
        <View style={{ marginTop: 32, marginBottom: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#111', letterSpacing: -0.5 }}>
            Agrega tus fotos
          </Text>
          <Text style={{ fontSize: 15, color: '#6b7280', marginTop: 8, lineHeight: 22 }}>
            Los perfiles con fotos tienen hasta 3× más matches. La primera será tu foto principal.
          </Text>
        </View>

        {/* Photo slots */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 28 }}>
          {slots.map(({ index, photo }) => (
            <View key={index} style={{ position: 'relative' }}>
              <Pressable
                onPress={() => !photo && !uploading && handlePickAndUpload(index)}
                style={{
                  width: SLOT_SIZE,
                  height: SLOT_SIZE * 1.35,
                  borderRadius: 16,
                  backgroundColor: photo ? 'transparent' : '#f9fafb',
                  borderWidth: photo ? 0 : 2,
                  borderStyle: 'dashed',
                  borderColor: '#e5e7eb',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {photo ? (
                  <Image
                    source={{ uri: photo.url }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  uploading && index === photos.length ? (
                    <ActivityIndicator size="small" color="#2D7E34" />
                  ) : (
                    <View style={{ alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="add" size={22} color="#2D7E34" />
                      </View>
                      {index === 0 && (
                        <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>Principal</Text>
                      )}
                    </View>
                  )
                )}
              </Pressable>

              {/* Delete button */}
              {photo && (
                <Pressable
                  onPress={() => handleDelete(photo)}
                  style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              )}

              {/* Badge "Principal" */}
              {photo && index === 0 && (
                <View style={{ position: 'absolute', bottom: 6, left: 6, backgroundColor: '#2D7E34', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>PRINCIPAL</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 12 }}>
          {photos.length}/{MAX_PHOTOS} fotos subidas
        </Text>
      </View>

      {/* Bottom actions */}
      <View style={{ padding: 24, paddingBottom: 40, gap: 12 }}>
        <Pressable
          onPress={() => navigation.navigate('OnboardingProfile')}
          style={{ backgroundColor: '#2D7E34', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            {photos.length > 0 ? 'Continuar' : 'Continuar sin fotos'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
