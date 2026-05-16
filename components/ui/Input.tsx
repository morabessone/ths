import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { cn } from '@/lib/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({ label, error, containerClassName, className, ...props }: InputProps) {
  return (
    <View className={cn('mb-4', containerClassName)}>
      {label ? (
        <Text className="font-sans-medium text-text-primary mb-2 text-sm">{label}</Text>
      ) : null}
      <TextInput
        accessibilityLabel={label ?? props.placeholder}
        placeholderTextColor="#A0A0B0"
        className={cn(
          'bg-surface border border-border rounded-xl px-4 py-3 font-sans text-text-primary text-base',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      {error ? <Text className="text-danger text-sm mt-1 font-sans">{error}</Text> : null}
    </View>
  );
}
