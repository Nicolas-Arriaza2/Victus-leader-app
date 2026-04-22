import apiClient from './client';

export interface ForumAuthor {
  id: string;
  username: string | null;
  profile: { firstName: string | null; lastName: string | null; avatarUrl: string | null } | null;
}

export interface ForumAnswer {
  id: string;
  questionId: string;
  authorId: string;
  author: ForumAuthor;
  body: string;
  createdAt: string;
}

export interface ForumQuestion {
  id: string;
  activityId: string;
  authorId: string;
  author: ForumAuthor;
  body: string;
  createdAt: string;
  answers: ForumAnswer[];
}

export const forumApi = {
  list: (activityId: string) =>
    apiClient.get<ForumQuestion[]>(`/activities/${activityId}/forum`),

  postQuestion: (activityId: string, body: string) =>
    apiClient.post<ForumQuestion>(`/activities/${activityId}/forum`, { body }),

  postAnswer: (activityId: string, questionId: string, body: string) =>
    apiClient.post<ForumAnswer>(`/activities/${activityId}/forum/${questionId}/answers`, { body }),

  deleteQuestion: (activityId: string, questionId: string) =>
    apiClient.delete(`/activities/${activityId}/forum/${questionId}`),

  deleteAnswer: (activityId: string, questionId: string, answerId: string) =>
    apiClient.delete(`/activities/${activityId}/forum/${questionId}/answers/${answerId}`),
};
