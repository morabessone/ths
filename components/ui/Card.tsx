import { Pressable, View, type ViewProps } from 'react-native';
import { cn } from '@/lib/cn';

interface CardProps extends ViewProps {
  onPress?: () => void;
  highlighted?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Card({ onPress, highlighted, className, children, ...props }: CardProps) {
  const content = (
    <View
      className={cn(
        'bg-surface rounded-2xl p-4 shadow-card',
        highlighted && 'border-l-4 border-l-primary',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return content;
}
