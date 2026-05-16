import { View } from 'react-native';

interface ProgressIndicatorProps {
  current: number;
  total?: number;
}

export function ProgressIndicator({ current, total = 5 }: ProgressIndicatorProps) {
  return (
    <View className="flex-row justify-center gap-2 py-4">
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <View
            key={step}
            className={`h-2 rounded-full ${
              isActive ? 'w-8 bg-primary' : isDone ? 'w-2 bg-primary-dark' : 'w-2 bg-border'
            }`}
          />
        );
      })}
    </View>
  );
}
