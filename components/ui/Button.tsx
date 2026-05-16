import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: string;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-primary-light',
  ghost: 'bg-transparent border border-primary',
  danger: 'bg-danger',
};

const textStyles: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-primary',
  ghost: 'text-primary',
  danger: 'text-white',
};

const sizeStyles: Record<Size, string> = {
  sm: 'py-2 px-4',
  md: 'py-4 px-6',
  lg: 'py-5 px-8',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (loading) {
      rotation.value = withRepeat(withTiming(360, { duration: 800 }), -1, false);
    }
  }, [loading, rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={children}
      disabled={isDisabled}
      className={cn(
        'rounded-xl items-center justify-center flex-row',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && 'opacity-50',
        className
      )}
      {...props}
    >
      {loading ? (
        <Animated.View style={spinStyle}>
          <ActivityIndicator color={variant === 'secondary' ? '#5B4FCF' : '#FFFFFF'} />
        </Animated.View>
      ) : (
        <Text className={cn('font-sans-semibold text-base', textStyles[variant])}>{children}</Text>
      )}
    </Pressable>
  );
}
