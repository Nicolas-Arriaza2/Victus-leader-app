import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@victus:token';
const USER_KEY = '@victus:user';
const ONBOARDING_KEY = '@victus:onboarding_completed';
const SWIPE_FILTERS_KEY = '@victus:swipe_filters';
const TOUR_KEY = '@victus:tour_completed';

export const storage = {
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  async getUser<T>(): Promise<T | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  },

  async setUser(user: object): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, ONBOARDING_KEY, SWIPE_FILTERS_KEY, TOUR_KEY]);
  },

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },

  async getOnboardingCompleted(): Promise<boolean | null> {
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (val === null) return null; // not found → old user, skip onboarding
    return val === 'true';
  },

  async setOnboardingCompleted(value: boolean): Promise<void> {
    await AsyncStorage.setItem(ONBOARDING_KEY, value ? 'true' : 'false');
  },

  async getSwipeFilters(): Promise<object | null> {
    const raw = await AsyncStorage.getItem(SWIPE_FILTERS_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },

  async setSwipeFilters(filters: object): Promise<void> {
    await AsyncStorage.setItem(SWIPE_FILTERS_KEY, JSON.stringify(filters));
  },

  async getTourCompleted(): Promise<boolean> {
    const val = await AsyncStorage.getItem(TOUR_KEY);
    return val === 'true';
  },

  async setTourCompleted(value: boolean): Promise<void> {
    await AsyncStorage.setItem(TOUR_KEY, value ? 'true' : 'false');
  },
};
