import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface FeedbackToastProps {
  message: string | null;
  onHide: () => void;
}

export function FeedbackToast({ message, onHide }: FeedbackToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onHide, 2200);
    return () => clearTimeout(t);
  }, [message, onHide]);

  if (!message) return null;

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      className="absolute bottom-8 left-4 right-4 z-50 bg-text-primary rounded-xl py-3 px-4"
    >
      <Text className="font-sans-medium text-white text-center text-sm">{message}</Text>
    </Animated.View>
  );
}
