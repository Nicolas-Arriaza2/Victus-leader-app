import { LeaderBankInfo, User, UserPhoto } from '../../types/api';
import apiClient from './client';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  gender?: string;
  birthDate?: string;
}

export interface UpdateBankInfoDto {
  rut: string;
  holderName: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  email: string;
}

export const usersApi = {
  me: () =>
    apiClient.get<User>('/users/me'),

  updateProfile: (dto: UpdateProfileDto) =>
    apiClient.patch<User>('/users/me/profile', dto),

  getBankInfo: () =>
    apiClient.get<LeaderBankInfo>('/users/me/bank-info'),

  updateBankInfo: (dto: UpdateBankInfoDto) =>
    apiClient.put<LeaderBankInfo>('/users/me/bank-info', dto),

  myPhotos: () =>
    apiClient.get<UserPhoto[]>('/users/me/photos'),

  deletePhoto: (position: number) =>
    apiClient.delete(`/users/me/photos/${position}`),

  reorderPhoto: (position: number, newPosition: number) =>
    apiClient.patch(`/users/me/photos/${position}/reorder`, { newPosition }),

  setInterests: (interestIds: string[]) =>
    apiClient.put('/users/me/interests', { interestIds }),
};
