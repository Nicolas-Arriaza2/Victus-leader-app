# Pendientes que requieren cambios en el backend

## 1. Username en perfil
**Frontend:** campo "Nombre de usuario" en EditProfileScreen.
**Backend requerido:** aceptar `username` en `PATCH /api/users/me/profile`
- Actualmente `UpdateProfileDto` no incluye `username`
- Validar unicidad antes de guardar

## 2. Push notifications reales
**Frontend:** registrar token al iniciar sesión con `expo-notifications`.
**Backend requerido:**
- `POST /api/notifications/push-token` — guardar Expo push token por usuario
- Integrar envío de push en `NotificationsService` al crear notificaciones
- Tabla o campo `pushToken` en User o tabla separada `UserPushToken`

## 3. Búsqueda y filtro de actividades
**Frontend:** barra de búsqueda en ActivitiesListScreen.
**Backend requerido:** agregar query params a `GET /api/activities/mine`
- `?search=yoga` — búsqueda por título
- `?type=wellness` — filtro por tipo
- `?isActive=true` — filtro por estado

## 4. Check-in QR
**Frontend:** botón en SessionDetail que abre escáner (expo-barcode-scanner), lee un código QR por inscripción.
**Backend requerido:**
- `GET /api/enrollments/:id/qr` — generar QR con token firmado para cada inscripción
- `POST /api/sessions/:id/checkin` — verificar token QR y marcar asistencia automáticamente
