import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { notificationsApi } from '../services/api/notifications';
import { storage } from '../utils/storage';

// Configura cómo se muestran las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  return token;
}

/**
 * Registra el dispositivo para push notifications al montar.
 * Obtiene el token de Expo, lo guarda en AsyncStorage y lo envía al backend
 * para que el servidor pueda enviar notificaciones reales al dispositivo.
 */
export function usePushNotifications() {
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(async (token) => {
        if (!token) return;
        await storage.setItem('@victus:pushToken', token);
        // Siempre sincronizar con el backend (el endpoint es idempotente)
        await notificationsApi.registerPushToken(token);
      })
      .catch(() => {
        // No crashear si falla el registro (permisos denegados, sin red, etc.)
      });

    // Listener para notificaciones recibidas en primer plano
    const sub = Notifications.addNotificationReceivedListener(() => {
      // El badge se actualiza via NotificationBadgeContext
    });

    return () => sub.remove();
  }, []);
}
