import { Interest } from '../../types/api';
import apiClient from './client';

export const interestsApi = {
  list: () => apiClient.get<Interest[]>('/interests'),
};
