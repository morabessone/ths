import { useState } from 'react';
import { ScrollView, Text, View, Pressable, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ShopItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
}

const SAMPLE_ITEMS: ShopItem[] = [
  { id: '1', name: 'Brócoli', quantity: 500, unit: 'g', category: 'vegetables', checked: false },
  { id: '2', name: 'Pechuga de pollo', quantity: 1500, unit: 'g', category: 'protein', checked: false },
  { id: '3', name: 'Huevos', quantity: 12, unit: 'unidad', category: 'dairy', checked: false },
  { id: '4', name: 'Avena', quantity: 500, unit: 'g', category: 'pantry', checked: false },
  { id: '5', name: 'Omega-3 EPA/DHA', quantity: 1, unit: 'unidad', category: 'supplements', checked: false },
];

const SECTIONS: Record<string, string> = {
  vegetables: '🥦 Verduras y frutas',
  protein: '🥩 Proteínas',
  dairy: '🧀 Lácteos y huevos',
  pantry: '🫙 Almacenables y granos',
  supplements: '💊 Suplementos',
};

export default function ShopScreen() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const [items, setItems] = useState(SAMPLE_ITEMS);

  const toggle = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const shareList = async () => {
    const text = items
      .map((i) => `${i.checked ? '✓' : '○'} ${i.name} — ${i.quantity} ${i.unit}`)
      .join('\n');
    await Share.share({ message: `Lista LivIn:\n${text}` });
  };

  const grouped = Object.keys(SECTIONS).map((cat) => ({
    category: cat,
    label: SECTIONS[cat],
    items: items.filter((i) => i.category === cat),
  }));

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="px-4" stickyHeaderIndices={[]}>
        <Text className="font-display text-text-primary text-3xl mt-2 mb-1">Compras de la semana</Text>
        <Text className="font-sans text-text-secondary mb-4">
          {format(weekStart, 'd MMM', { locale: es })} – {format(weekEnd, 'd MMM', { locale: es })}
        </Text>
        <View className="flex-row gap-2 mb-6">
          <Button variant="secondary" size="sm" onPress={() => setItems(SAMPLE_ITEMS)}>
            Regenerar lista
          </Button>
          <Button variant="ghost" size="sm" onPress={shareList}>
            Compartir
          </Button>
        </View>

        {grouped.map(
          (section) =>
            section.items.length > 0 && (
              <View key={section.category} className="mb-6">
                <Text className="font-sans-semibold text-text-primary mb-2">{section.label}</Text>
                {section.items.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: item.checked }}
                    onPress={() => toggle(item.id)}
                  >
                    <Card className="mb-2 flex-row items-center gap-3">
                      <Text className="text-lg">{item.checked ? '☑' : '☐'}</Text>
                      <View className="flex-1">
                        <Text
                          className={`font-sans text-text-primary ${item.checked ? 'line-through opacity-50' : ''}`}
                        >
                          {item.name}
                        </Text>
                        <Text className="font-sans text-text-tertiary text-sm">
                          {item.quantity} {item.unit}
                        </Text>
                      </View>
                    </Card>
                  </Pressable>
                ))}
              </View>
            )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
