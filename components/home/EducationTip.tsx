import { Text, Pressable } from 'react-native';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { EducationTip as EducationTipType } from '@/types/nutrition.types';

interface EducationTipProps {
  tip: EducationTipType | null;
  onExplore?: () => void;
}

export function EducationTip({ tip, onExplore }: EducationTipProps) {
  const [expanded, setExpanded] = useState(false);
  if (!tip) return null;

  return (
    <Card className="mb-4">
      <Badge label={tip.topic} />
      <Text className="font-display text-text-primary text-lg mt-2 mb-2">{tip.title}</Text>
      <Text
        className="font-sans text-text-secondary text-sm leading-5"
        numberOfLines={expanded ? undefined : 3}
      >
        {tip.content}
      </Text>
      <Pressable
        accessibilityRole="button"
        className="mt-2"
        onPress={() => setExpanded(!expanded)}
      >
        <Text className="font-sans-semibold text-primary text-sm">
          {expanded ? 'Ver menos' : 'Leer más'}
        </Text>
      </Pressable>
      {onExplore ? (
        <Pressable accessibilityRole="link" className="mt-2" onPress={onExplore}>
          <Text className="font-sans-semibold text-primary text-sm">Explorar más →</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}
