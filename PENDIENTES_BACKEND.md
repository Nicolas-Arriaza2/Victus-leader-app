# Pendientes de backend

## 1. Username en perfil
**Frontend:** ✅ listo — campo en EditProfileScreen, se envía en PATCH /api/users/me/profile.
**Backend pendiente:**
- Agregar `username?: string` a `UpdateProfileDto`
- Validar unicidad antes de guardar (`@IsUnique` o query manual)
- Retornar `username` actualizado en la respuesta

## 2. Push notifications reales
**Frontend:** ✅ listo — `usePushNotifications` registra el token de Expo y lo guarda
  en AsyncStorage con clave `@victus:pushToken`.
**Backend pendiente:**
- `POST /api/notifications/push-token` — recibir y persistir el token por usuario
- Nuevo campo `expoPushToken` en tabla `User` (o tabla separada `UserDevice`)
- En `NotificationsService.create()`, llamar a `expo-server-sdk` para enviar push real
- Dependencia a instalar en backend: `expo-server-sdk`

## 3. Búsqueda de actividades
**Frontend:** ✅ listo — filtrado client-side por título, descripción y tipo.
**Backend pendiente (opcional, para escala):**
- Agregar query params `?search=` y `?type=` a `GET /api/activities/mine`
- Útil cuando un líder tenga cientos de actividades

## 4. Check-in QR
**Frontend:** ✅ listo — `CheckInScreen` con `expo-camera`, escanea QR y llama al endpoint.
  Actualmente muestra el token escaneado (mock) hasta que el backend esté listo.
**Backend pendiente:**
- `GET /api/enrollments/:id/qr-token` — generar JWT firmado con `enrollmentId` + `sessionId`
- `POST /api/sessions/:id/checkin` — verificar el JWT, validar que el enrollment pertenece
  a la sesión, y cambiar `status` a `attended`
- El QR se muestra en la app del participante (user-app, pendiente de desarrollo)
