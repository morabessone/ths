import { Text, View } from 'react-native';
import { cn } from '@/lib/cn';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
}

const variants = {
  primary: 'bg-primary-light',
  success: 'bg-success/10',
  danger: 'bg-danger/10',
  warning: 'bg-warning/10',
};

const textVariants = {
  primary: 'text-primary',
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
};

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  return (
    <View className={cn('rounded-full px-3 py-1', variants[variant])}>
      <Text className={cn('text-xs font-sans-semibold', textVariants[variant])}>{label}</Text>
    </View>
  );
}
