import { LeaderEarnings, TransferSchedule } from '../../types/api';
import apiClient from './client';

export const paymentsApi = {
  myEarnings: () =>
    apiClient.get<LeaderEarnings>('/payments/my-earnings'),

  transferSchedule: () =>
    apiClient.get<TransferSchedule>('/payments/transfer-schedule'),
};
