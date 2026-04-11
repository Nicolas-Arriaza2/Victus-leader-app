import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { ProfileStackScreenProps } from '../../navigation/types';

export function ProfileScreen({ navigation }: ProfileStackScreenProps<'Profile'>) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);
  };

  const displayName =
    user?.profile?.firstName
      ? `${user.profile.firstName} ${user.profile.lastName ?? ''}`.trim()
      : user?.email ?? 'Líder';

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <ScrollView className="flex-1 bg-cream">
      {/* Avatar + name */}
      <View className="items-center bg-white pt-8 pb-6 mx-4 mt-4 rounded-2xl shadow-sm border border-gray-100">
        <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3 overflow-hidden">
          {user?.profile?.avatarUrl ? (
            <Image
              source={{ uri: user.profile.avatarUrl }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-primary-600 text-2xl font-bold">{initials || '👤'}</Text>
          )}
        </View>
        <Text className="text-xl font-bold text-gray-900">{displayName}</Text>
        <Text className="text-sm text-gray-400 mt-0.5">{user?.email}</Text>
        <View className="flex-row mt-3 gap-1">
          {user?.roles.map((role) => (
            <View key={role} className="bg-primary-50 px-3 py-0.5 rounded-full">
              <Text className="text-xs text-primary-600 font-medium">
                {role === 'COMMUNITY_LEADER' ? 'Líder' : role}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Menu */}
      <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {[
          { label: 'Editar Perfil',         icon: 'person-outline',      screen: 'EditProfile'    as const },
          { label: 'Mis Fotos',             icon: 'images-outline',      screen: 'Photos'         as const },
          { label: 'Ver cómo me ven',       icon: 'eye-outline',         screen: 'ProfilePreview' as const },
          { label: 'Ganancias',             icon: 'cash-outline',        screen: 'Earnings'       as const },
          { label: 'Datos Bancarios',       icon: 'card-outline',        screen: 'BankInfo'       as const },
        ].map((item, idx) => (
          <Pressable
            key={item.screen}
            className={`flex-row items-center px-4 py-4 ${idx > 0 ? 'border-t border-gray-100' : ''}`}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View className="w-8 h-8 rounded-lg bg-cream items-center justify-center">
              <Ionicons name={item.icon as any} size={18} color="#2D7E34" />
            </View>
            <Text className="ml-3 text-base text-gray-800 flex-1">{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
          </Pressable>
        ))}
      </View>

      {/* Logout */}
      <Pressable
        className="mx-4 mt-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex-row items-center px-4 py-4"
        onPress={handleLogout}
      >
        <View className="w-8 h-8 rounded-lg bg-red-50 items-center justify-center">
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        </View>
        <Text className="ml-3 text-base text-red-500">Cerrar sesión</Text>
      </Pressable>

      <View className="h-8" />
    </ScrollView>
  );
}
