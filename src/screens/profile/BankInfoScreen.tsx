import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { usersApi } from '../../services/api/users';
import { BankAccountType } from '../../types/api';
import { ProfileStackScreenProps } from '../../navigation/types';

const ACCOUNT_TYPES: { label: string; value: BankAccountType }[] = [
  { label: 'Cuenta Corriente', value: 'cuenta_corriente' },
  { label: 'Cuenta Vista', value: 'cuenta_vista' },
  { label: 'Cuenta Ahorro', value: 'cuenta_ahorro' },
  { label: 'Cuenta RUT', value: 'cuenta_rut' },
];

export function BankInfoScreen(_props: ProfileStackScreenProps<'BankInfo'>) {
  const [rut, setRut] = useState('');
  const [holderName, setHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<BankAccountType>('cuenta_corriente');
  const [accountNumber, setAccountNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    usersApi
      .getBankInfo()
      .then(({ data }) => {
        setRut(data.rut);
        setHolderName(data.holderName);
        setBankName(data.bankName);
        setAccountType(data.accountType);
        setAccountNumber(data.accountNumber);
        setEmail(data.email);
        setIsVerified(data.isVerified);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!rut.trim() || !holderName.trim() || !bankName.trim() || !accountNumber.trim() || !email.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      await usersApi.updateBankInfo({
        rut: rut.trim(),
        holderName: holderName.trim(),
        bankName: bankName.trim(),
        accountType,
        accountNumber: accountNumber.trim(),
        email: email.trim().toLowerCase(),
      });
      Alert.alert('Listo', 'Datos bancarios actualizados.');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al guardar';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-cream"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerClassName="p-6 gap-5" keyboardShouldPersistTaps="handled">
        {/* Estado verificación */}
        <View
          className={`flex-row items-center gap-2 px-4 py-3 rounded-xl ${
            isVerified ? 'bg-primary-50' : 'bg-warning-50'
          }`}
        >
          <Ionicons
            name={isVerified ? 'checkmark-circle' : 'time-outline'}
            size={18}
            color={isVerified ? '#2D7E34' : '#92400e'}
          />
          <Text
            className={`text-sm font-medium ${isVerified ? 'text-primary-700' : 'text-amber-800'}`}
          >
            {isVerified ? 'Cuenta verificada' : 'Pendiente de verificación'}
          </Text>
        </View>

        {/* RUT */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">RUT titular *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            placeholder="12.345.678-9"
            value={rut}
            onChangeText={setRut}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
          />
        </View>

        {/* Nombre titular */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Nombre del titular *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            value={holderName}
            onChangeText={setHolderName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Banco */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Banco *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            placeholder="Ej: Banco de Chile"
            value={bankName}
            onChangeText={setBankName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Tipo de cuenta */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Tipo de cuenta *</Text>
          <View className="flex-row flex-wrap gap-2">
            {ACCOUNT_TYPES.map((t) => (
              <Pressable
                key={t.value}
                onPress={() => setAccountType(t.value)}
                className={`px-3 py-1.5 rounded-full border ${
                  accountType === t.value
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`text-sm ${
                    accountType === t.value ? 'text-white font-medium' : 'text-gray-700'
                  }`}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Número de cuenta */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Número de cuenta *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
            returnKeyType="next"
          />
        </View>

        {/* Email de transferencia */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Email de transferencia *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base bg-white"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>

        {/* Botón */}
        <Pressable
          className={`rounded-xl py-4 items-center bg-primary-500 ${saving ? 'opacity-60' : ''}`}
          onPress={handleSave}
          disabled={saving}
        >
          <Text className="text-white font-bold text-base">
            {saving ? 'Guardando...' : 'Guardar datos bancarios'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
