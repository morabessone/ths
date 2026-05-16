import { Text, View } from 'react-native';
import { cn } from '@/lib/cn';

interface CalloutProps {
  title?: string;
  children: string;
  variant?: 'info' | 'warning' | 'medical';
  className?: string;
}

export function Callout({ title, children, variant = 'info', className }: CalloutProps) {
  return (
    <View
      className={cn(
        className,
        'rounded-xl p-4 border-l-4',
        variant === 'info' && 'bg-primary-light border-l-primary',
        variant === 'warning' && 'bg-warning/10 border-l-warning',
        variant === 'medical' && 'bg-primary-light border-l-primary'
      )}
    >
      {title ? (
        <Text className="font-sans-semibold text-text-primary mb-1 text-sm">{title}</Text>
      ) : null}
      <Text className="font-sans text-text-secondary text-sm leading-5">{children}</Text>
    </View>
  );
}
