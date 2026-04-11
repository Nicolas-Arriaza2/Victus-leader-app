import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import apiClient from '../../services/api/client';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../services/api/users';
import { UserPhoto } from '../../types/api';
import { ProfileStackScreenProps } from '../../navigation/types';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3;
const MAX_PHOTOS = 3;

export function PhotosScreen(_props: ProfileStackScreenProps<'Photos'>) {
  const { refreshUser } = useAuth();
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await usersApi.myPhotos();
      setPhotos(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePickAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para subir fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
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
      await Promise.all([load(), refreshUser()]);
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
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await usersApi.deletePhoto(photo.position);
            await Promise.all([load(), refreshUser()]);
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la foto.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  const canUpload = photos.length < MAX_PHOTOS;

  return (
    <ScrollView
      className="flex-1 bg-cream"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2D7E34" />
      }
    >
      <View className="p-4">
        {/* Info */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="text-sm text-gray-500 text-center">
            Máximo {MAX_PHOTOS} fotos · La primera es tu foto de perfil
          </Text>
        </View>

        {/* Grid de fotos */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          {photos.map((photo) => (
            <View key={photo.id} style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}>
              <Image
                source={{ uri: photo.url }}
                style={{ width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 12 }}
                resizeMode="cover"
              />
              {photo.position === 0 && (
                <View className="absolute top-1.5 left-1.5 bg-primary-500 rounded-full px-2 py-0.5">
                  <Text className="text-white text-xs font-medium">Principal</Text>
                </View>
              )}
              <Pressable
                onPress={() => handleDelete(photo)}
                className="absolute top-1.5 right-1.5 bg-black/50 rounded-full w-7 h-7 items-center justify-center"
              >
                <Ionicons name="trash-outline" size={14} color="white" />
              </Pressable>
            </View>
          ))}

          {/* Celda de agregar foto */}
          {canUpload && (
            <Pressable
              onPress={handlePickAndUpload}
              disabled={uploading}
              style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
              className={`border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-white ${uploading ? 'opacity-50' : ''}`}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#2D7E34" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={28} color="#9ca3af" />
                  <Text className="text-xs text-gray-400 mt-1">Agregar</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* Contador */}
        <Text className="text-center text-sm text-gray-400">
          {photos.length}/{MAX_PHOTOS} fotos
        </Text>
      </View>
    </ScrollView>
  );
}
