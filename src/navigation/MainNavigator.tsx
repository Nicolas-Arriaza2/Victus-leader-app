import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, View } from 'react-native';

import { ActivitiesListScreen } from '../screens/activities/ActivitiesListScreen';
import { ActivityCreateScreen } from '../screens/activities/ActivityCreateScreen';
import { ActivityDetailScreen } from '../screens/activities/ActivityDetailScreen';
import { ActivityEditScreen } from '../screens/activities/ActivityEditScreen';
import { EarningsScreen } from '../screens/earnings/EarningsScreen';
import { EnrollmentsScreen } from '../screens/enrollments/EnrollmentsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { BankInfoScreen } from '../screens/profile/BankInfoScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { PhotosScreen } from '../screens/profile/PhotosScreen';
import { ProfilePreviewScreen } from '../screens/profile/ProfilePreviewScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SessionCreateScreen } from '../screens/sessions/SessionCreateScreen';
import { SessionDetailScreen } from '../screens/sessions/SessionDetailScreen';
import { SessionEditScreen } from '../screens/sessions/SessionEditScreen';
import { SessionListScreen } from '../screens/sessions/SessionListScreen';
import { SubscribersScreen } from '../screens/subscriptions/SubscribersScreen';
import { CheckInScreen } from '../screens/sessions/CheckInScreen';
import { SwipeScreen } from '../screens/swipe/SwipeScreen';
import { CompatibilityStatsScreen } from '../screens/swipe/CompatibilityStatsScreen';
import { NotificationBadgeProvider, useNotificationBadge } from '../context/NotificationBadgeContext';

import {
  ActivitiesStackParamList,
  MainTabParamList,
  ProfileStackParamList,
  SwipeStackParamList,
} from './types';

// ─── Stack Navigators ─────────────────────────────────────────────────────────

const SwipeStack = createNativeStackNavigator<SwipeStackParamList>();
function SwipeStackNavigator() {
  return (
    <SwipeStack.Navigator screenOptions={{ headerShown: false }}>
      <SwipeStack.Screen name="Discover" component={SwipeScreen} />
      <SwipeStack.Screen
        name="CompatibilityStats"
        component={CompatibilityStatsScreen}
        options={{
          headerShown: true,
          title: 'Compatibilidad',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#2D7E34',
        }}
      />
    </SwipeStack.Navigator>
  );
}

const ActivitiesStack = createNativeStackNavigator<ActivitiesStackParamList>();
function ActivitiesStackNavigator() {
  return (
    <ActivitiesStack.Navigator
      screenOptions={{ headerStyle: { backgroundColor: '#fff' }, headerTintColor: '#2D7E34' }}
    >
      <ActivitiesStack.Screen name="ActivitiesList" component={ActivitiesListScreen} options={{ title: 'Actividades' }} />
      <ActivitiesStack.Screen name="ActivityDetail" component={ActivityDetailScreen} options={{ title: 'Actividad' }} />
      <ActivitiesStack.Screen name="ActivityCreate" component={ActivityCreateScreen} options={{ title: 'Nueva Actividad' }} />
      <ActivitiesStack.Screen name="ActivityEdit" component={ActivityEditScreen} options={{ title: 'Editar Actividad' }} />
      <ActivitiesStack.Screen name="SessionList" component={SessionListScreen} options={({ route }) => ({ title: route.params.activityTitle })} />
      <ActivitiesStack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Sesión' }} />
      <ActivitiesStack.Screen name="SessionCreate" component={SessionCreateScreen} options={{ title: 'Nueva Sesión' }} />
      <ActivitiesStack.Screen name="SessionEdit" component={SessionEditScreen} options={{ title: 'Editar Sesión' }} />
      <ActivitiesStack.Screen name="Enrollments" component={EnrollmentsScreen} options={{ title: 'Inscritos' }} />
      <ActivitiesStack.Screen name="Subscribers" component={SubscribersScreen} options={({ route }) => ({ title: `Suscriptores · ${route.params.activityTitle}` })} />
      <ActivitiesStack.Screen name="CheckIn" component={CheckInScreen} options={{ title: 'Check-in QR', headerShown: false }} />
    </ActivitiesStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackNavigator() {
  const { unreadCount, fetchUnread } = useNotificationBadge();

  return (
    <ProfileStack.Navigator
      screenOptions={{ headerStyle: { backgroundColor: '#fff' }, headerTintColor: '#2D7E34' }}
    >
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Mi Perfil',
          headerRight: () => (
            <Pressable
              onPress={() => {
                fetchUnread();
                navigation.navigate('Notifications');
              }}
              style={{ marginRight: 4, padding: 4 }}
            >
              <View>
                <Ionicons name="notifications-outline" size={24} color="#2D7E34" />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      backgroundColor: '#ED6F49',
                      borderRadius: 8,
                      minWidth: 16,
                      height: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 2,
                    }}
                  >
                    <Ionicons name="ellipse" size={8} color="#fff" />
                  </View>
                )}
              </View>
            </Pressable>
          ),
        })}
      />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Editar Perfil' }} />
      <ProfileStack.Screen name="BankInfo" component={BankInfoScreen} options={{ title: 'Datos Bancarios' }} />
      <ProfileStack.Screen name="Photos" component={PhotosScreen} options={{ title: 'Mis Fotos' }} />
      <ProfileStack.Screen name="ProfilePreview" component={ProfilePreviewScreen} options={{ title: 'Vista previa', headerTransparent: true, headerTintColor: 'white' }} />
      <ProfileStack.Screen name="Earnings" component={EarningsScreen} options={{ title: 'Ganancias' }} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
    </ProfileStack.Navigator>
  );
}

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { focused: IoniconsName; unfocused: IoniconsName }> = {
  SwipeTab:      { focused: 'heart',     unfocused: 'heart-outline' },
  ActivitiesTab: { focused: 'calendar',  unfocused: 'calendar-outline' },
  ProfileTab:    { focused: 'person',    unfocused: 'person-outline' },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2D7E34',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e5e7eb', paddingBottom: 4 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          return <Ionicons name={focused ? icons.focused : icons.unfocused} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="SwipeTab" component={SwipeStackNavigator} options={{ title: 'Descubrir' }} />
      <Tab.Screen name="ActivitiesTab" component={ActivitiesStackNavigator} options={{ title: 'Actividades' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <NotificationBadgeProvider>
      <Tabs />
    </NotificationBadgeProvider>
  );
}
