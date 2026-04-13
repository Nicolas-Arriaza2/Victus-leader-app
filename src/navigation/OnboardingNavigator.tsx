import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { OnboardingPhotosStep } from '../screens/onboarding/OnboardingPhotosStep';
import { OnboardingProfileStep } from '../screens/onboarding/OnboardingProfileStep';
import { OnboardingInterestsStep } from '../screens/onboarding/OnboardingInterestsStep';
import { OnboardingSwipeStep } from '../screens/onboarding/OnboardingSwipeStep';
import { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="OnboardingPhotos"    component={OnboardingPhotosStep} />
      <Stack.Screen name="OnboardingProfile"   component={OnboardingProfileStep} />
      <Stack.Screen name="OnboardingInterests" component={OnboardingInterestsStep} />
      <Stack.Screen name="OnboardingSwipe"     component={OnboardingSwipeStep} />
    </Stack.Navigator>
  );
}
