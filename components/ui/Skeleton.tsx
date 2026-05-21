import { View, type ViewStyle } from 'react-native';
import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  style?: ViewStyle;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <View className={cn('bg-border rounded-xl animate-pulse', className)} style={style} />;
}
