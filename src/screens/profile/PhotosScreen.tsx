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
  const [reordering, setReordering] = useState(false);
  const [selectedPos, setSelectedPos] = useState<number | null>(null);

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
            setSelectedPos(null);
            await Promise.all([load(), refreshUser()]);
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la foto.');
          }
        },
      },
    ]);
  };

  const handleMove = async (from: number, direction: -1 | 1) => {
    const to = from + direction;
    if (to < 0 || to >= photos.length) return;
    try {
      await usersApi.reorderPhoto(from, to);
      setSelectedPos(to);
      await Promise.all([load(), refreshUser()]);
    } catch {
      Alert.alert('Error', 'No se pudo mover la foto.');
    }
  };

  const exitReorder = () => {
    setReordering(false);
    setSelectedPos(null);
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
        {/* Info / modo reordenar */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 flex-row items-center justify-between">
          {reordering ? (
            <>
              <Text className="text-sm text-primary-600 font-medium flex-1">
                Mantené presionada para seleccionar, luego usá las flechas
              </Text>
              <Pressable onPress={exitReorder} className="ml-3 bg-primary-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">Listo</Text>
              </Pressable>
            </>
          ) : (
            <Text className="text-sm text-gray-500 text-center flex-1">
              Máximo {MAX_PHOTOS} fotos · La primera es tu foto de perfil
            </Text>
          )}
        </View>

        {/* Grid de fotos */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          {photos.map((photo) => {
            const isSelected = reordering && selectedPos === photo.position;
            return (
              <Pressable
                key={photo.id}
                style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
                onLongPress={() => {
                  setReordering(true);
                  setSelectedPos(photo.position);
                }}
                onPress={() => {
                  if (reordering) setSelectedPos(photo.position);
                }}
              >
                <Image
                  source={{ uri: photo.url }}
                  style={{
                    width: PHOTO_SIZE,
                    height: PHOTO_SIZE,
                    borderRadius: 12,
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: '#2D7E34',
                    transform: [{ scale: isSelected ? 1.04 : 1 }],
                  }}
                  resizeMode="cover"
                />

                {/* Badge "Principal" */}
                {photo.position === 0 && (
                  <View className="absolute top-1.5 left-1.5 bg-primary-500 rounded-full px-2 py-0.5">
                    <Text className="text-white text-xs font-medium">Principal</Text>
                  </View>
                )}

                {/* Controles reordenar (foto seleccionada) */}
                {isSelected && (
                  <View className="absolute bottom-1.5 left-0 right-0 flex-row justify-center gap-1">
                    <Pressable
                      onPress={() => handleMove(photo.position, -1)}
                      className={`bg-black/60 rounded-full w-7 h-7 items-center justify-center ${photo.position === 0 ? 'opacity-30' : ''}`}
                      disabled={photo.position === 0}
                    >
                      <Ionicons name="chevron-back" size={16} color="white" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleMove(photo.position, 1)}
                      className={`bg-black/60 rounded-full w-7 h-7 items-center justify-center ${photo.position === photos.length - 1 ? 'opacity-30' : ''}`}
                      disabled={photo.position === photos.length - 1}
                    >
                      <Ionicons name="chevron-forward" size={16} color="white" />
                    </Pressable>
                  </View>
                )}

                {/* Botón eliminar (solo fuera del modo reordenar) */}
                {!reordering && (
                  <Pressable
                    onPress={() => handleDelete(photo)}
                    className="absolute top-1.5 right-1.5 bg-black/50 rounded-full w-7 h-7 items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={14} color="white" />
                  </Pressable>
                )}
              </Pressable>
            );
          })}

          {/* Celda agregar foto */}
          {canUpload && !reordering && (
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

        <Text className="text-center text-sm text-gray-400">
          {photos.length}/{MAX_PHOTOS} fotos
        </Text>
      </View>
    </ScrollView>
  );
}
