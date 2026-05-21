import { Text, View } from 'react-native';

export function WatchedBadge() {
  return (
    <View className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-success items-center justify-center">
      <Text className="text-white text-xs font-sans-bold">✓</Text>
    </View>
  );
}
