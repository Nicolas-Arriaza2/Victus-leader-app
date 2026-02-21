import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
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

  const { data: token } = await Notifications.getExpoPushTokenAsync();
  return token;
}

/**
 * Registra el dispositivo para push notifications al montar.
 * Guarda el token en AsyncStorage con clave @victus:pushToken.
 * El token se enviará al backend cuando el endpoint esté disponible
 * (ver PENDIENTES_BACKEND.md).
 */
export function usePushNotifications() {
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(async (token) => {
        if (!token) return;
        // Guardar localmente — backend endpoint pendiente
        await storage.setItem('@victus:pushToken', token);
        // TODO: cuando exista el endpoint, llamar:
        // await apiClient.post('/notifications/push-token', { token });
      })
      .catch(() => {});

    // Listener para notificaciones recibidas en primer plano
    const sub = Notifications.addNotificationReceivedListener(() => {
      // El badge se actualiza via NotificationBadgeContext
    });

    return () => sub.remove();
  }, []);
}
