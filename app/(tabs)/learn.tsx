import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

const TOPICS = [
  { id: 'metabolism', name: 'Metabolismo', lessons: 6, icon: '⚡' },
  { id: 'timing', name: 'Timing nutricional', lessons: 5, icon: '⏱' },
  { id: 'supplements', name: 'Suplementación', lessons: 7, icon: '💊' },
  { id: 'metabolic_health', name: 'Salud metabólica', lessons: 4, icon: '❤️' },
  { id: 'training', name: 'Entrenamiento y nutrición', lessons: 5, icon: '🏋️' },
];

export default function LearnScreen() {
  const { canAccess } = useFeatureAccess();
  const locked = !canAccess('education_full');

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="px-4">
        <Text className="font-display text-text-primary text-3xl mt-2 mb-6">Aprender</Text>
        <View className="flex-row flex-wrap gap-3">
          {TOPICS.map((topic, index) => {
            const isLocked = locked && index > 1;
            return (
              <Pressable
                key={topic.id}
                accessibilityRole="button"
                accessibilityLabel={topic.name}
                className="w-[47%]"
                disabled={isLocked}
              >
                <Card className={`min-h-[140px] ${isLocked ? 'opacity-50' : ''}`}>
                  <Text className="text-2xl mb-2">{isLocked ? '🔒' : topic.icon}</Text>
                  <Text className="font-sans-semibold text-text-primary">{topic.name}</Text>
                  <Text className="font-sans text-text-tertiary text-sm mt-1">
                    {topic.lessons} lecciones
                  </Text>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
