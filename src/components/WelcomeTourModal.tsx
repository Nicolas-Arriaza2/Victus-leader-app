import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// ─── Slide data ───────────────────────────────────────────────────────────────

const SLIDES = [
  {
    icon: '👋' as const,
    iconColor: '#2D7E34',
    title: '¡Bienvenido/a a Biktus!',
    description:
      'Esta es tu app para conectar con personas a través de actividades grupales. Tenés 3 secciones principales en la barra inferior.',
    tips: [],
  },
  {
    icon: 'heart' as const,
    iconColor: '#ef4444',
    title: 'Descubrir ❤️',
    description:
      'Explorá perfiles de personas que participan en actividades similares a las tuyas.',
    tips: [
      { icon: 'arrow-forward-outline', text: 'Deslizá a la derecha para dar Like' },
      { icon: 'close-outline',         text: 'Deslizá a la izquierda para pasar' },
      { icon: 'options-outline',        text: 'Toca el filtro (arriba a la derecha) para ajustar edad, distancia y género' },
      { icon: 'bar-chart-outline',      text: 'El ícono de estadísticas muestra tu compatibilidad' },
    ],
  },
  {
    icon: 'calendar' as const,
    iconColor: '#2D7E34',
    title: 'Actividades 📅',
    description:
      'Creá y gestioná tus actividades. Controlá inscritos, sesiones y pagos desde acá.',
    tips: [
      { icon: 'add-circle-outline',  text: 'Toca "+" para crear una nueva actividad' },
      { icon: 'people-outline',       text: 'Accedé a los inscritos y marcá pagos manualmente' },
      { icon: 'notifications-outline',text: 'Enviá recordatorios de pago a tus participantes' },
      { icon: 'qr-code-outline',      text: 'Usá el QR de cada sesión para registrar asistencia' },
    ],
  },
  {
    icon: 'person' as const,
    iconColor: '#7c3aed',
    title: 'Perfil 👤',
    description:
      'Tu perfil es tu carta de presentación. Completalo para conseguir más matches.',
    tips: [
      { icon: 'camera-outline',      text: 'Agregá fotos (hasta 3) para destacar tu perfil' },
      { icon: 'pencil-outline',      text: '"Editar perfil" para bio, género, orientación e intereses' },
      { icon: 'eye-outline',         text: '"Vista previa" para ver cómo te ven otros' },
      { icon: 'card-outline',        text: '"Datos bancarios" para configurar tus transferencias' },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export function WelcomeTourModal({ visible, onDismiss }: Props) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const isLast = current === SLIDES.length - 1;
  const slide = SLIDES[current];

  const goTo = (index: number) => {
    setCurrent(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleNext = () => {
    if (isLast) { onDismiss(); return; }
    goTo(current + 1);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40, maxHeight: '88%' }}>

          {/* Progress dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 20, paddingBottom: 4 }}>
            {SLIDES.map((_, i) => (
              <Pressable key={i} onPress={() => goTo(i)}>
                <View style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === current ? '#2D7E34' : '#e5e7eb' }} />
              </Pressable>
            ))}
          </View>

          {/* Scrollable slides */}
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            style={{ width }}
          >
            {SLIDES.map((s, i) => (
              <View key={i} style={{ width, paddingHorizontal: 28, paddingTop: 24 }}>
                {/* Icon */}
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  {typeof s.icon === 'string' && s.icon.length > 2 ? (
                    <Text style={{ fontSize: 36 }}>{s.icon}</Text>
                  ) : (
                    <Ionicons name={s.icon as any} size={38} color={s.iconColor} />
                  )}
                </View>

                {/* Title */}
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#111', letterSpacing: -0.3, marginBottom: 10 }}>
                  {s.title}
                </Text>

                {/* Description */}
                <Text style={{ fontSize: 15, color: '#6b7280', lineHeight: 22, marginBottom: 20 }}>
                  {s.description}
                </Text>

                {/* Tips */}
                {s.tips.length > 0 && (
                  <View style={{ gap: 12 }}>
                    {s.tips.map((tip) => (
                      <View key={tip.text} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                          <Ionicons name={tip.icon as any} size={18} color="#374151" />
                        </View>
                        <Text style={{ flex: 1, fontSize: 14, color: '#374151', lineHeight: 20, marginTop: 7 }}>
                          {tip.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Action buttons */}
          <View style={{ paddingHorizontal: 28, paddingTop: 24, gap: 10 }}>
            <Pressable
              onPress={handleNext}
              style={{ backgroundColor: '#2D7E34', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                {isLast ? '¡Empezar!' : 'Siguiente'}
              </Text>
            </Pressable>

            {!isLast && (
              <Pressable onPress={onDismiss} style={{ alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ fontSize: 14, color: '#9ca3af' }}>Saltar tutorial</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
