import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useUserStore } from '@/stores/useUserStore';
import { useChatStore } from '@/stores/useChatStore';
import { APP_TAGLINE, LOADING_CHAT } from '@/constants/copy-tone';

const QUICK_PROMPTS = [
  '¿Qué como ahora?',
  '¿Qué suplemento tomar hoy?',
  '¿Cómo mejorar mi sueño?',
];

function buildWelcome(name: string, trainingTime?: string) {
  const hour = new Date().getHours();
  const timeLabel = `${hour}:${String(new Date().getMinutes()).padStart(2, '0')}`;
  const day = new Date().toLocaleDateString('es-AR', { weekday: 'long' });
  const trainNote =
    trainingTime === 'afternoon' || trainingTime === 'evening'
      ? ' Veo que entrenás a la tarde.'
      : trainingTime === 'morning'
        ? ' Veo que entrenás a la mañana.'
        : '';
  return `Hola ${name}. Son las ${timeLabel}, ${day}.${trainNote} ¿En qué te puedo ayudar hoy?`;
}

export default function ChatScreen() {
  const profile = useUserStore((s) => s.profile);
  const user = useUserStore((s) => s.user);
  const bio = useUserStore((s) => s.latestBiometrics);
  const userId = user?.id ?? profile?.id;
  const name = profile?.full_name?.split(' ')[0] ?? 'Usuario';

  const { messages, isTyping, isLoading, error, loadHistory, sendMessage } = useChatStore();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (userId) loadHistory(userId);
  }, [userId, loadHistory]);

  const displayMessages =
    messages.length === 0 && !isLoading
      ? [
          {
            id: 'welcome',
            role: 'assistant' as const,
            content: buildWelcome(name, bio?.training_time ?? undefined),
          },
        ]
      : messages;

  const handleSend = async () => {
    if (!input.trim() || !userId || isTyping) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const text = input;
    setInput('');
    await sendMessage(userId, text);
  };

  const showChips = messages.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-4 py-3 border-b border-border">
        <Text className="font-display text-text-primary text-xl">LivIn</Text>
        <Text className="font-sans text-text-tertiary text-xs">· {APP_TAGLINE}</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={listRef}
          inverted
          data={[...displayMessages].reverse()}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />}
          ListHeaderComponent={isTyping ? <TypingIndicator /> : null}
        />

        {isTyping ? (
          <Text className="font-sans text-text-tertiary text-xs text-center pb-1">{LOADING_CHAT}</Text>
        ) : null}
        {error ? (
          <Text className="font-sans text-danger text-xs text-center px-4 pb-1">{error}</Text>
        ) : null}

        {showChips ? (
          <View className="flex-row flex-wrap gap-2 px-4 pb-2">
            {QUICK_PROMPTS.map((p) => (
              <Pressable
                key={p}
                accessibilityRole="button"
                onPress={() => setInput(p)}
                className="bg-primary-light rounded-full px-3 py-1.5"
              >
                <Text className="font-sans text-primary text-sm">{p}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View className="flex-row items-end px-4 pb-4 pt-2 gap-2 border-t border-border">
          <TextInput
            className="flex-1 font-sans bg-surface border border-border rounded-2xl px-4 py-3 text-text-primary min-h-[44px] max-h-[120px]"
            placeholder="Escribí tu pregunta..."
            placeholderTextColor="#A0A0B0"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar"
            onPress={handleSend}
            className="w-11 h-11 rounded-full bg-primary items-center justify-center"
          >
            <Text className="text-white text-lg">↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
