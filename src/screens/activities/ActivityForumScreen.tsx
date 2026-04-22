import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ForumQuestion, forumApi } from '../../services/api/forum';
import { useAuth } from '../../hooks/useAuth';
import { ActivitiesStackScreenProps } from '../../navigation/types';

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function AuthorAvatar({ author }: { author: ForumQuestion['author'] }) {
  const uri = author.profile?.avatarUrl;
  const name = author.profile?.firstName ?? author.username ?? '?';
  const initials = name[0]?.toUpperCase() ?? '?';
  return (
    <View className="w-9 h-9 rounded-full bg-primary-100 overflow-hidden items-center justify-center">
      {uri
        ? <Image source={{ uri }} style={{ width: 36, height: 36 }} />
        : <Text className="text-primary-600 font-bold text-sm">{initials}</Text>}
    </View>
  );
}

function AuthorName({ author }: { author: ForumQuestion['author'] }) {
  const fn = author.profile?.firstName;
  const ln = author.profile?.lastName;
  if (fn) return <Text className="text-sm font-semibold text-gray-900">{fn} {ln ?? ''}</Text>;
  return <Text className="text-sm font-semibold text-gray-900">@{author.username ?? 'usuario'}</Text>;
}

export function ActivityForumScreen({ route }: ActivitiesStackScreenProps<'Forum'>) {
  const { activityId } = route.params;
  const { user } = useAuth();
  const [questions, setQuestions]     = useState<ForumQuestion[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [replyingTo, setReplyingTo]   = useState<string | null>(null);
  const [replyText, setReplyText]     = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await forumApi.list(activityId);
      setQuestions(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activityId]);

  useEffect(() => { load(); }, [load]);

  const handlePostQuestion = async () => {
    const body = questionText.trim();
    if (!body || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await forumApi.postQuestion(activityId, body);
      setQuestions((prev) => [data, ...prev]);
      setQuestionText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostAnswer = async () => {
    if (!replyingTo) return;
    const body = replyText.trim();
    if (!body || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await forumApi.postAnswer(activityId, replyingTo, body);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === replyingTo ? { ...q, answers: [...q.answers, data] } : q,
        ),
      );
      setReplyText('');
      setReplyingTo(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    Alert.alert('Eliminar pregunta', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          await forumApi.deleteQuestion(activityId, questionId);
          setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        },
      },
    ]);
  };

  const handleDeleteAnswer = (questionId: string, answerId: string) => {
    Alert.alert('Eliminar respuesta', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          await forumApi.deleteAnswer(activityId, questionId, answerId);
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === questionId
                ? { ...q, answers: q.answers.filter((a) => a.id !== answerId) }
                : q,
            ),
          );
        },
      },
    ]);
  };

  const startReply = (questionId: string) => {
    setReplyingTo(questionId);
    setReplyText('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#2D7E34" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-cream"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2D7E34" />}
        contentContainerClassName="px-4 pt-4 pb-4 gap-4"
        keyboardShouldPersistTaps="handled"
      >
        {/* Empty state */}
        {questions.length === 0 && (
          <View className="items-center py-16">
            <Ionicons name="chatbubbles-outline" size={56} color="#9ca3af" />
            <Text className="text-gray-500 font-semibold mt-4 text-center">
              Sin preguntas aún
            </Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">
              Sé el primero en preguntar algo.
            </Text>
          </View>
        )}

        {/* Questions list */}
        {questions.map((q) => (
          <View key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Question header */}
            <View className="p-4">
              <View className="flex-row items-start gap-3">
                <AuthorAvatar author={q.author} />
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <AuthorName author={q.author} />
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xs text-gray-400">{timeAgo(q.createdAt)}</Text>
                      {(q.authorId === user?.id) && (
                        <Pressable onPress={() => handleDeleteQuestion(q.id)} hitSlop={8}>
                          <Ionicons name="trash-outline" size={14} color="#ef4444" />
                        </Pressable>
                      )}
                    </View>
                  </View>
                  <Text className="text-sm text-gray-700 mt-1.5 leading-5">{q.body}</Text>
                </View>
              </View>

              {/* Reply button */}
              <Pressable
                className="mt-3 self-start flex-row items-center gap-1"
                onPress={() => startReply(q.id)}
              >
                <Ionicons name="return-down-forward-outline" size={14} color="#2D7E34" />
                <Text className="text-xs text-primary-600 font-medium">
                  {q.answers.length > 0 ? `${q.answers.length} respuesta${q.answers.length > 1 ? 's' : ''}` : 'Responder'}
                </Text>
              </Pressable>
            </View>

            {/* Answers */}
            {q.answers.length > 0 && (
              <View className="border-t border-gray-50 bg-gray-50/60">
                {q.answers.map((a) => (
                  <View key={a.id} className="px-4 py-3 flex-row gap-3 border-b border-gray-100 last:border-b-0">
                    <View className="w-px bg-primary-200 self-stretch ml-4 mr-1" />
                    <AuthorAvatar author={a.author} />
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <AuthorName author={a.author} />
                        <View className="flex-row items-center gap-2">
                          <Text className="text-xs text-gray-400">{timeAgo(a.createdAt)}</Text>
                          {(a.authorId === user?.id) && (
                            <Pressable onPress={() => handleDeleteAnswer(q.id, a.id)} hitSlop={8}>
                              <Ionicons name="trash-outline" size={14} color="#ef4444" />
                            </Pressable>
                          )}
                        </View>
                      </View>
                      <Text className="text-sm text-gray-700 mt-1 leading-5">{a.body}</Text>
                    </View>
                  </View>
                ))}

                {/* Inline reply input */}
                {replyingTo === q.id && (
                  <View className="px-4 py-3 flex-row gap-3 items-end border-t border-gray-100">
                    <View className="w-px bg-primary-300 self-stretch ml-4 mr-1" />
                    <TextInput
                      ref={inputRef}
                      className="flex-1 bg-white rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 min-h-[40px]"
                      placeholder="Escribe tu respuesta..."
                      placeholderTextColor="#9ca3af"
                      value={replyText}
                      onChangeText={setReplyText}
                      multiline
                    />
                    <Pressable
                      className={`w-9 h-9 rounded-xl items-center justify-center ${replyText.trim() ? 'bg-primary-500' : 'bg-gray-200'}`}
                      onPress={handlePostAnswer}
                      disabled={!replyText.trim() || submitting}
                    >
                      {submitting
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Ionicons name="send" size={16} color={replyText.trim() ? '#fff' : '#9ca3af'} />}
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {/* Reply input for questions with no answers yet */}
            {q.answers.length === 0 && replyingTo === q.id && (
              <View className="border-t border-gray-100 px-4 py-3 flex-row gap-3 items-end bg-gray-50/60">
                <TextInput
                  ref={inputRef}
                  className="flex-1 bg-white rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 min-h-[40px]"
                  placeholder="Escribe tu respuesta..."
                  placeholderTextColor="#9ca3af"
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                />
                <Pressable
                  className={`w-9 h-9 rounded-xl items-center justify-center ${replyText.trim() ? 'bg-primary-500' : 'bg-gray-200'}`}
                  onPress={handlePostAnswer}
                  disabled={!replyText.trim() || submitting}
                >
                  {submitting
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Ionicons name="send" size={16} color={replyText.trim() ? '#fff' : '#9ca3af'} />}
                </Pressable>
              </View>
            )}
          </View>
        ))}

        <View className="h-4" />
      </ScrollView>

      {/* New question input */}
      <View className="bg-white border-t border-gray-100 px-4 py-3 flex-row gap-3 items-end">
        <TextInput
          className="flex-1 bg-cream rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 min-h-[44px] max-h-[100px]"
          placeholder="Hacer una pregunta..."
          placeholderTextColor="#9ca3af"
          value={questionText}
          onChangeText={(t) => { setQuestionText(t); setReplyingTo(null); }}
          multiline
        />
        <Pressable
          className={`w-11 h-11 rounded-2xl items-center justify-center ${questionText.trim() ? 'bg-primary-500' : 'bg-gray-200'}`}
          onPress={handlePostQuestion}
          disabled={!questionText.trim() || submitting}
        >
          {submitting
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="send" size={18} color={questionText.trim() ? '#fff' : '#9ca3af'} />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
