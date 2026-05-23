import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/stores/useUserStore';
import { usePantryStore, type ShoppingSuggestionItem } from '@/stores/usePantryStore';
export default function ShoppingListScreen() {
  const user = useUserStore((s) => s.user);
  const profile = useUserStore((s) => s.profile);
  const userId = user?.id ?? profile?.id ?? '';
  const { shoppingItems, budgetEstimate, loadShoppingSuggestions, regenerateShoppingList, isLoading, addManual } =
    usePantryStore();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [localItems, setLocalItems] = useState<ShoppingSuggestionItem[]>([]);

  useEffect(() => {
    if (userId) loadShoppingSuggestions(userId);
  }, [userId, loadShoppingSuggestions]);

  useEffect(() => {
    setLocalItems(shoppingItems);
  }, [shoppingItems]);

  const toggle = (name: string) => setChecked((c) => ({ ...c, [name]: !c[name] }));

  const handleBought = (item: ShoppingSuggestionItem) => {
    Alert.alert('¿Lo agregás a tu alacena?', item.name, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí',
        onPress: async () => {
          if (userId) {
            await addManual(userId, item.name, item.category as never);
          }
          setLocalItems((list) => list.filter((i) => i.name !== item.name));
        },
      },
    ]);
  };

  const shareList = async () => {
    const lines = localItems.map((i) => `• ${i.name}${checked[i.name] ? ' ✓' : ''}`);
    const budget = budgetEstimate as { total_min?: number; total_max?: number; currency?: string } | null;
    const budgetLine =
      budget?.total_min != null
        ? `\nPresupuesto orientativo: ${budget.total_min}-${budget.total_max} ${budget.currency ?? 'ARS'}`
        : '';
    await Share.share({
      message: `Lista LivIn\n${lines.join('\n')}${budgetLine}`,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
      <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <Button variant="secondary" loading={isLoading} onPress={() => regenerateShoppingList(userId)} className="mt-2 mb-4">
          Actualizar sugerencias
        </Button>

        {localItems.map((item) => (
          <Card key={item.name} className="mb-2">
            <Pressable accessibilityRole="checkbox" onPress={() => toggle(item.name)}>
              <Text className="font-sans-semibold text-text-primary">
                {checked[item.name] ? '✓ ' : ''}
                {item.name}
              </Text>
              <Text className="font-sans text-text-tertiary text-sm">{item.reason}</Text>
            </Pressable>
            {checked[item.name] ? (
              <Pressable accessibilityRole="button" className="mt-2" onPress={() => handleBought(item)}>
                <Text className="text-primary font-sans-semibold text-sm">Marcar como comprado</Text>
              </Pressable>
            ) : null}
          </Card>
        ))}

        <Button className="mt-4" onPress={shareList}>
          Compartir lista
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
