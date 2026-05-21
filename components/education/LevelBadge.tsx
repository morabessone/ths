import { Text, View } from 'react-native';
import type { VideoLevel } from '@/types/education.types';

const LEVEL_CONFIG: Record<VideoLevel, { label: string; bg: string; text: string }> = {
  beginner: { label: 'Principiante', bg: '#E1F5EE', text: '#0F6E56' },
  intermediate: { label: 'Intermedio', bg: '#FAEEDA', text: '#633806' },
  advanced: { label: 'Avanzado', bg: '#FAECE7', text: '#712B13' },
};

interface LevelBadgeProps {
  level: VideoLevel;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const config = LEVEL_CONFIG[level];
  return (
    <View
      className="rounded-full px-2 py-0.5"
      style={{ backgroundColor: config.bg }}
    >
      <Text className="text-[11px] font-sans-medium" style={{ color: config.text }}>
        {config.label}
      </Text>
    </View>
  );
}
