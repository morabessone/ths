import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { learnCategoryHref } from '@/lib/education/routes';
import type { EducationCategory } from '@/types/education.types';

interface CategoryCardProps {
  category: EducationCategory;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const router = useRouter();
  const total = category.video_count ?? 0;
  const watched = category.watched_count ?? 0;
  const progress = total > 0 ? watched / total : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category.name}
      onPress={() => router.push(learnCategoryHref(category.slug))}
      className="rounded-2xl overflow-hidden h-[110px] mb-3"
      style={{
        backgroundColor: hexToRgba(category.cover_color, 0.15),
        borderLeftWidth: 3,
        borderLeftColor: category.cover_color,
      }}
    >
      <View className="flex-1 p-3 justify-between">
        <Text className="text-[32px] leading-9">{category.emoji ?? '📚'}</Text>
        <View>
          <Text className="font-sans-semibold text-text-primary text-[15px]">{category.name}</Text>
          <Text className="font-sans text-text-tertiary text-xs mt-0.5">
            {total} videos · {watched} vistos
          </Text>
          <View className="mt-1.5">
            <View className="h-[3px] bg-border rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.round(progress * 100)}%`,
                  backgroundColor: category.cover_color,
                }}
              />
            </View>
            <Text className="font-sans text-text-tertiary text-[10px] mt-0.5">
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
