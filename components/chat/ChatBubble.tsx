import { Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

const markdownStyles = {
  body: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: '#1A1A2E' },
  strong: { fontFamily: 'DMSans_600SemiBold' },
};

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <View className={`mb-3 max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}>
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser ? 'bg-primary' : 'bg-surface border border-border'
        }`}
      >
        {isUser ? (
          <Text className="font-sans text-white text-[15px]">{content}</Text>
        ) : (
          <Markdown style={markdownStyles}>{content}</Markdown>
        )}
      </View>
    </View>
  );
}
