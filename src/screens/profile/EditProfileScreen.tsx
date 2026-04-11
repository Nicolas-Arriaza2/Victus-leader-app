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
import { ProfileStackScreenProps } from '../../navigation/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_MAIN: { label: string; value: Gender }[] = [
  { label: 'Hombre',              value: 'male'       },
  { label: 'Mujer',               value: 'female'     },
  { label: 'Más allá del binario',value: 'non_binary' },
  { label: 'Prefiero no decir',   value: 'na'         },
];

const GENDER_DETAILS: string[] = [
  'Agénero',
  'Bigénero',
  'Género fluido',
  'Cuestionamiento de género',
  'Genderqueer',
  'Intersexual',
  'No binario/a/e',
  'Pangénero',
  'Persona trans',
  'Transfemenino',
  'Transmasculino',
  'Dos espíritus',
  'No aparece en la lista',
];

const ORIENTATIONS: string[] = [
  'Heterosexual',
  'Gay / Homosexual',
  'Lesbiana',
  'Bisexual',
  'Pansexual',
  'Asexual',
  'Demisexual',
  'Queer',
  'Omnisexual',
  'Arromántico',
  'Explorando',
  'No aparece en la lista',
];

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 }}>
      {title}
    </Text>
  );
}

// ─── ChipGroup ────────────────────────────────────────────────────────────────

function ChipGroup({
  options,
  selected,
  onToggle,
  single = false,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  single?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <Pressable
            key={opt}
            onPress={() => onToggle(opt)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: active ? '#2D7E34' : '#e5e7eb',
              backgroundColor: active ? '#f0fdf4' : '#fff',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#2D7E34' : '#6b7280' }}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── EditProfileScreen ────────────────────────────────────────────────────────

export function EditProfileScreen({ navigation }: ProfileStackScreenProps<'EditProfile'>) {
  const { user, refreshUser, updateUser } = useAuth();
  const p = user?.profile;

  const [firstName,  setFirstName]  = useState(p?.firstName ?? '');
  const [lastName,   setLastName]   = useState(p?.lastName ?? '');
  const [username,   setUsername]   = useState(user?.username ?? '');
  const [bio,        setBio]        = useState(p?.bio ?? '');

  // Gender
  const [gender,         setGenderVal]     = useState<Gender | null>((p?.gender as Gender) ?? null);
  const [genderDetails,  setGenderDetails] = useState<string[]>(p?.genderDetails ?? []);
  const [showGender,     setShowGender]    = useState(p?.showGender ?? true);

  // Orientation
  const [orientation,    setOrientation]   = useState<string[]>(p?.sexualOrientation ?? []);
  const [showOrientation,setShowOri]       = useState(p?.showOrientation ?? true);

  const [showDetailsSection, setShowDetailsSection] = useState((p?.genderDetails?.length ?? 0) > 0);
  const [saving, setSaving] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const toggleDetail = (v: string) =>
    setGenderDetails((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const toggleOrientation = (v: string) =>
    setOrientation((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const handleSave = async () => {
    if (!firstName.trim()) { Alert.alert('Error', 'El nombre es obligatorio.'); return; }
    setSaving(true);
    try {
      await usersApi.updateProfile({
        firstName:        firstName.trim(),
        lastName:         lastName.trim() || undefined,
        username:         username.trim() || undefined,
        bio:              bio.trim() || undefined,
        gender:           gender ?? undefined,
        genderDetails,
        sexualOrientation: orientation,
        showGender,
        showOrientation,
      });
      updateUser({
        username: username.trim() || user?.username,
        profile: {
          ...p,
          firstName:        firstName.trim(),
          lastName:         lastName.trim() || null,
          bio:              bio.trim() || null,
          gender:           gender,
          genderDetails,
          sexualOrientation: orientation,
          showGender,
          showOrientation,
        },
      });
      refreshUser();
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al guardar';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-cream" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">

        {/* ── Básico ─────────────────────────────────────────────────────────── */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 14, borderWidth: 1, borderColor: '#f3f4f6' }}>
          <SectionHeader title="Información básica" />

          <View>
            <Text className="text-xs text-gray-500 mb-1">Email</Text>
            <View className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
              <Text className="text-gray-400">{user?.email}</Text>
            </View>
          </View>

          <View>
            <Text className="text-xs text-gray-500 mb-1">Nombre *</Text>
            <TextInput className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          </View>

          <View>
            <Text className="text-xs text-gray-500 mb-1">Apellido</Text>
            <TextInput className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
          </View>

          <View>
            <Text className="text-xs text-gray-500 mb-1">Nombre de usuario</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
              placeholder="ej: valentina_yoga"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text className="text-xs text-gray-400 mt-1">Solo letras, números, puntos y guiones bajos</Text>
          </View>

          <View>
            <Text className="text-xs text-gray-500 mb-1">Sobre mí</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 90 }}
              placeholder="Cuéntanos sobre ti y tus actividades..."
            />
          </View>
        </View>

        {/* ── Género ─────────────────────────────────────────────────────────── */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 14, borderWidth: 1, borderColor: '#f3f4f6' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionHeader title="Género" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>Mostrar en perfil</Text>
              <Switch
                value={showGender}
                onValueChange={setShowGender}
                trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                thumbColor={showGender ? '#2D7E34' : '#fff'}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>

          {/* Level 1 — main */}
          <ChipGroup
            options={GENDER_MAIN.map((g) => g.label)}
            selected={gender ? [GENDER_MAIN.find((g) => g.value === gender)?.label ?? ''] : []}
            onToggle={(label) => {
              const found = GENDER_MAIN.find((g) => g.label === label);
              setGenderVal(found ? found.value : null);
            }}
            single
          />

          {/* Level 2 toggle */}
          <Pressable
            onPress={() => setShowDetailsSection((v) => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Ionicons name={showDetailsSection ? 'chevron-down' : 'chevron-forward'} size={14} color="#2D7E34" />
            <Text style={{ fontSize: 13, color: '#2D7E34', fontWeight: '600' }}>
              Agrega más sobre tu género (opcional)
            </Text>
          </Pressable>

          {showDetailsSection && (
            <ChipGroup
              options={GENDER_DETAILS}
              selected={genderDetails}
              onToggle={toggleDetail}
            />
          )}
        </View>

        {/* ── Orientación ────────────────────────────────────────────────────── */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 14, borderWidth: 1, borderColor: '#f3f4f6' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionHeader title="Orientación sexual" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>Mostrar en perfil</Text>
              <Switch
                value={showOrientation}
                onValueChange={setShowOri}
                trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                thumbColor={showOrientation ? '#2D7E34' : '#fff'}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>

          <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: -8 }}>Selección múltiple</Text>

          <ChipGroup
            options={ORIENTATIONS}
            selected={orientation}
            onToggle={toggleOrientation}
          />
        </View>

        {/* ── Guardar ────────────────────────────────────────────────────────── */}
        <Pressable
          style={{ backgroundColor: saving ? '#86efac' : '#2D7E34', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Text>
        </Pressable>

        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
