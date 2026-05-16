import { Text, View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number;
  label: string;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  onPress?: () => void;
}

function getBarColor(pct: number): string {
  if (pct < 50) return 'bg-danger';
  if (pct < 80) return 'bg-warning';
  if (pct < 100) return 'bg-primary';
  return 'bg-success';
}

export function ProgressBar({
  value,
  label,
  currentValue,
  targetValue,
  unit,
  onPress,
}: ProgressBarProps) {
  const width = useSharedValue(0);
  const pct = Math.min(100, Math.max(0, value));

  useEffect(() => {
    width.value = withTiming(pct, { duration: 600 });
  }, [pct, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const content = (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="font-sans-medium text-text-primary text-sm">{label}</Text>
        {currentValue !== undefined && targetValue !== undefined ? (
          <Text className="font-sans text-text-secondary text-xs">
            {Math.round(currentValue)}/{Math.round(targetValue)}
            {unit ? ` ${unit}` : ''}
          </Text>
        ) : null}
      </View>
      <View className="h-2 bg-border rounded-full overflow-hidden">
        <Animated.View className={cn('h-full rounded-full', getBarColor(pct))} style={barStyle} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return content;
}
