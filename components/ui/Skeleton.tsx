import { View } from 'react-native';
import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <View className={cn('bg-border rounded-xl animate-pulse', className)} />;
}
