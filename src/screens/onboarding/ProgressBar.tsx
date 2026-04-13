import React from 'react';
import { Dimensions, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export function ProgressBar({ step, total }: { step: number; total: number }) {
  const progress = step / total;

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 8 }}>
      {/* Bar */}
      <View style={{ height: 4, backgroundColor: '#e5e7eb', borderRadius: 2 }}>
        <View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: '#2D7E34',
            width: `${progress * 100}%`,
          }}
        />
      </View>
      <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
        Paso {step} de {total}
      </Text>
    </View>
  );
}
