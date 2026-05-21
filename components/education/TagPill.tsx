import { Pressable, Text, View } from 'react-native';

interface TagPillProps {
  tag: string;
  onPress?: (tag: string) => void;
}

export function TagPill({ tag, onPress }: TagPillProps) {
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Buscar ${tag}`}
        onPress={() => onPress(tag)}
        className="rounded-full px-3 py-1 mr-2 mb-2 bg-primary-light border border-primary"
      >
        <Text className="font-sans text-primary text-xs">{tag}</Text>
      </Pressable>
    );
  }

  return (
    <View className="rounded-full px-3 py-1 mr-2 mb-2 bg-border">
      <Text className="font-sans text-text-secondary text-xs">{tag}</Text>
    </View>
  );
}
