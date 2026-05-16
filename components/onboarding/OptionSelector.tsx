import { Pressable, Text, View } from 'react-native';
import { cn } from '@/lib/cn';

export interface OptionItem<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: string;
}

interface OptionSelectorProps<T extends string> {
  options: OptionItem<T>[];
  value: T | T[] | null;
  multiple?: boolean;
  onChange: (value: T | T[]) => void;
}

export function OptionSelector<T extends string>({
  options,
  value,
  multiple,
  onChange,
}: OptionSelectorProps<T>) {
  const isSelected = (v: T) =>
    multiple ? (value as T[] | null)?.includes(v) : value === v;

  const toggle = (v: T) => {
    if (multiple) {
      const current = (value as T[] | null) ?? [];
      onChange(
        current.includes(v) ? current.filter((x) => x !== v) : [...current, v]
      );
    } else {
      onChange(v);
    }
  };

  return (
    <View className="gap-3">
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          accessibilityRole="button"
          accessibilityLabel={opt.label}
          onPress={() => toggle(opt.value)}
          className={cn(
            'rounded-2xl p-4 border-2',
            isSelected(opt.value)
              ? 'border-primary bg-primary-light'
              : 'border-border bg-surface'
          )}
        >
          <Text className="font-sans-semibold text-text-primary text-base">{opt.label}</Text>
          {opt.description ? (
            <Text className="font-sans text-text-secondary text-sm mt-1">{opt.description}</Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}
