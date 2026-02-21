import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { ActivitiesStackScreenProps } from '../../navigation/types';

type ScanState = 'scanning' | 'success' | 'error';

export function CheckInScreen({ route, navigation }: ActivitiesStackScreenProps<'CheckIn'>) {
  const { sessionId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [resultMessage, setResultMessage] = useState('');
  const cooldownRef = useRef(false);

  const handleBarCodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;

    try {
      // TODO: cuando el backend implemente el endpoint, reemplazar con:
      // const { data: result } = await apiClient.post(`/sessions/${sessionId}/checkin`, { token: data });
      // setScanState('success');
      // setResultMessage(`${result.userName} — asistencia registrada`);

      // Por ahora muestra el token escaneado (pendiente backend)
      setScanState('success');
      setResultMessage(`QR escaneado: ${data.slice(0, 40)}...\n\n⚠️ Verificación pendiente de backend`);
    } catch (err: any) {
      setScanState('error');
      setResultMessage(err?.response?.data?.message ?? 'QR inválido o ya utilizado');
    }

    // Resetear después de 3 segundos para seguir escaneando
    setTimeout(() => {
      setScanState('scanning');
      setResultMessage('');
      cooldownRef.current = false;
    }, 3000);
  }, [sessionId]);

  // Sin permiso aún
  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  // Permiso denegado
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Ionicons name="camera-outline" size={52} color="white" />
        <Text className="text-white text-lg font-semibold mt-4 text-center">
          Se necesita acceso a la cámara
        </Text>
        <Pressable
          className="mt-6 bg-primary-500 rounded-xl px-6 py-3"
          onPress={requestPermission}
        >
          <Text className="text-white font-semibold">Dar permiso</Text>
        </Pressable>
        <Pressable className="mt-3" onPress={() => navigation.goBack()}>
          <Text className="text-gray-400">Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanState === 'scanning' ? handleBarCodeScanned : undefined}
      />

      {/* Overlay */}
      <View className="absolute inset-0 items-center justify-center">
        {/* Marco del QR */}
        <View
          style={{
            width: 240,
            height: 240,
            borderRadius: 16,
            borderWidth: 3,
            borderColor: scanState === 'success' ? '#2D7E34'
              : scanState === 'error' ? '#ef4444'
              : 'white',
          }}
        />

        {/* Resultado */}
        {scanState !== 'scanning' && (
          <View className={`absolute bottom-40 mx-6 rounded-2xl p-5 items-center ${
            scanState === 'success' ? 'bg-primary-500' : 'bg-red-500'
          }`}
            style={{ width: 280 }}
          >
            <Ionicons
              name={scanState === 'success' ? 'checkmark-circle' : 'close-circle'}
              size={36}
              color="white"
            />
            <Text className="text-white font-semibold text-base text-center mt-2">
              {resultMessage}
            </Text>
          </View>
        )}
      </View>

      {/* Instrucción */}
      <View className="absolute top-0 left-0 right-0 pt-16 pb-6 items-center bg-black/40">
        <Text className="text-white text-base font-semibold">Escanear QR del inscrito</Text>
        <Text className="text-gray-300 text-sm mt-1">Apunta la cámara al código QR</Text>
      </View>

      {/* Botón cerrar */}
      <View className="absolute bottom-12 left-0 right-0 items-center">
        <Pressable
          className="bg-white/20 rounded-full px-8 py-3"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Cerrar</Text>
        </Pressable>
      </View>
    </View>
  );
}
