import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { usersApi } from '../../services/api/users';
import { useAuth } from '../../hooks/useAuth';
import { Gender } from '../../types/api';
import { OnboardingStackScreenProps } from '../../navigation/types';
import { ProgressBar } from './ProgressBar';

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_MAIN: { label: string; value: Gender }[] = [
  { label: 'Hombre',               value: 'male'       },
  { label: 'Mujer',                value: 'female'     },
  { label: 'Más allá del binario', value: 'non_binary' },
  { label: 'Prefiero no decir',    value: 'na'         },
];

const GENDER_DETAILS: string[] = [
  'Agénero', 'Bigénero', 'Género fluido', 'Cuestionamiento de género',
  'Genderqueer', 'Intersexual', 'No binario/a/e', 'Pangénero',
  'Persona trans', 'Transfemenino', 'Transmasculino', 'Dos espíritus',
  'No aparece en la lista',
];

const ORIENTATIONS: string[] = [
  'Heterosexual', 'Gay / Homosexual', 'Lesbiana', 'Bisexual',
  'Pansexual', 'Asexual', 'Demisexual', 'Queer', 'Omnisexual',
  'Arromántico', 'Explorando', 'No aparece en la lista',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Chip({
  label, active, onPress, disabled = false,
}: { label: string; active: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, borderWidth: 1.5,
        borderColor: active ? '#2D7E34' : disabled ? '#f3f4f6' : '#e5e7eb',
        backgroundColor: active ? '#f0fdf4' : disabled ? '#fafafa' : '#fff',
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#2D7E34' : disabled ? '#d1d5db' : '#6b7280' }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
      {title}
    </Text>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function OnboardingProfileStep({ navigation }: OnboardingStackScreenProps<'OnboardingProfile'>) {
  const { user, updateUser } = useAuth();
  const p = user?.profile;

  const [username,    setUsername]    = useState(user?.username ?? '');
  const [age,         setAge]         = useState('');
  const [bio,         setBio]         = useState(p?.bio ?? '');
  const [gender,      setGender]      = useState<Gender | null>((p?.gender as Gender) ?? null);
  const [details,     setDetails]     = useState<string[]>(p?.genderDetails ?? []);
  const [showDetails, setShowDetails] = useState(false);
  const [showGender,  setShowGender]  = useState(p?.showGender ?? true);
  const [orientation, setOrientation] = useState<string[]>(p?.sexualOrientation ?? []);
  const [showOri,     setShowOri]     = useState(p?.showOrientation ?? true);
  const [saving,      setSaving]      = useState(false);

  const toggleDetail = (v: string) =>
    setDetails((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const toggleOri = (v: string) =>
    setOrientation((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const handleContinue = async () => {
    const ageNum = parseInt(age, 10);
    if (age && (isNaN(ageNum) || ageNum < 16 || ageNum > 100)) {
      Alert.alert('Edad inválida', 'Ingresá un valor entre 16 y 100.');
      return;
    }

    setSaving(true);
    try {
      let birthDate: string | undefined;
      if (age && !isNaN(ageNum)) {
        const year = new Date().getFullYear() - ageNum;
        birthDate = new Date(year, 6, 1).toISOString(); // July 1st approximation
      }

      await usersApi.updateProfile({
        username:          username.trim() || undefined,
        bio:               bio.trim() || undefined,
        gender:            gender ?? undefined,
        genderDetails:     details,
        sexualOrientation: orientation,
        showGender,
        showOrientation:   showOri,
        birthDate,
      });

      updateUser({
        username: username.trim() || user?.username,
        profile: {
          firstName:         p?.firstName ?? null,
          lastName:          p?.lastName ?? null,
          bio:               bio.trim() || null,
          avatarUrl:         p?.avatarUrl ?? null,
          gender,
          genderDetails:     details,
          sexualOrientation: orientation,
          showGender,
          showOrientation:   showOri,
          birthDate:         p?.birthDate ?? null,
          city:              p?.city ?? null,
        },
      });

      navigation.navigate('OnboardingInterests');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al guardar';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ProgressBar step={2} total={4} />

      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 28, gap: 28 }} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#111', letterSpacing: -0.5 }}>Tu perfil</Text>
          <Text style={{ fontSize: 15, color: '#6b7280', marginTop: 8, lineHeight: 22 }}>
            Esta información aparece en tu tarjeta cuando otros te descubren.
          </Text>
        </View>

        {/* Username */}
        <View style={{ gap: 6 }}>
          <SectionLabel title="Nombre de usuario" />
          <TextInput
            value={username}
            onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
            placeholder="ej: valentina_yoga"
            autoCapitalize="none"
            autoCorrect={false}
            style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111' }}
          />
          <Text style={{ fontSize: 11, color: '#9ca3af' }}>Solo letras, números, puntos y guiones bajos</Text>
        </View>

        {/* Age */}
        <View style={{ gap: 6 }}>
          <SectionLabel title="Edad" />
          <TextInput
            value={age}
            onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
            placeholder="ej: 28"
            keyboardType="number-pad"
            maxLength={3}
            style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111' }}
          />
          <Text style={{ fontSize: 11, color: '#9ca3af' }}>Usamos tu edad para mostrarte personas compatibles</Text>
        </View>

        {/* Bio */}
        <View style={{ gap: 6 }}>
          <SectionLabel title="Sobre ti" />
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Cuéntanos sobre ti y lo que te apasiona..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111', minHeight: 96 }}
          />
        </View>

        {/* Gender */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionLabel title="Género" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>Mostrar</Text>
              <Switch
                value={showGender}
                onValueChange={setShowGender}
                trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                thumbColor={showGender ? '#2D7E34' : '#fff'}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {GENDER_MAIN.map((g) => (
              <Chip
                key={g.value}
                label={g.label}
                active={gender === g.value}
                onPress={() => setGender(gender === g.value ? null : g.value)}
              />
            ))}
          </View>
          <Pressable
            onPress={() => setShowDetails((v) => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
          >
            <Ionicons name={showDetails ? 'chevron-down' : 'chevron-forward'} size={13} color="#2D7E34" />
            <Text style={{ fontSize: 13, color: '#2D7E34', fontWeight: '600' }}>
              Agrega más sobre tu género (opcional)
            </Text>
          </Pressable>
          {showDetails && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {GENDER_DETAILS.map((d) => (
                <Chip key={d} label={d} active={details.includes(d)} onPress={() => toggleDetail(d)} />
              ))}
            </View>
          )}
        </View>

        {/* Orientation */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionLabel title="Orientación sexual" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>Mostrar</Text>
              <Switch
                value={showOri}
                onValueChange={setShowOri}
                trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                thumbColor={showOri ? '#2D7E34' : '#fff'}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>
          <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: -6 }}>Selección múltiple</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ORIENTATIONS.map((o) => (
              <Chip key={o} label={o} active={orientation.includes(o)} onPress={() => toggleOri(o)} />
            ))}
          </View>
        </View>

        {/* Continue */}
        <Pressable
          onPress={handleContinue}
          disabled={saving}
          style={{ backgroundColor: saving ? '#86efac' : '#2D7E34', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 4 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            {saving ? 'Guardando...' : 'Continuar'}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('OnboardingInterests')} style={{ alignItems: 'center', paddingBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#9ca3af' }}>Saltar por ahora</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
