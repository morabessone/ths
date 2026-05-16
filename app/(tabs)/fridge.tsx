import { useState } from 'react';
import { ScrollView, Text, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useFridgeStore } from '@/stores/useFridgeStore';
import { useUserStore } from '@/stores/useUserStore';
import type { Meal, MealType } from '@/types/nutrition.types';

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Desayuno' },
  { value: 'lunch', label: 'Almuerzo' },
  { value: 'snack', label: 'Merienda' },
  { value: 'dinner', label: 'Cena' },
];

export default function FridgeScreen() {
  const user = useUserStore((s) => s.user);
  const profile = useUserStore((s) => s.profile);
  const userId = user?.id ?? profile?.id ?? 'demo-user';
  const { stock, addIngredient, removeIngredient, clearStock, generateMeal } = useFridgeStore();
  const [query, setQuery] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [generated, setGenerated] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!query.trim()) return;
    await addIngredient({
      user_id: userId,
      ingredient_id: null,
      ingredient_name: query.trim(),
      quantity: 1,
      unit: 'unit',
      expires_at: null,
    });
    setQuery('');
  };

  const handleGenerate = async () => {
    setLoading(true);
    const meal = await generateMeal(mealType);
    setGenerated(meal);
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="px-4" keyboardShouldPersistTaps="handled">
        <Text className="font-display text-text-primary text-3xl mt-2 mb-4">Heladera</Text>
        <Input
          placeholder="¿Qué tenés en casa? Escribí los ingredientes..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleAdd}
        />
        <Button variant="secondary" onPress={handleAdd} className="mb-4">
          Agregar ingrediente
        </Button>

        <Text className="font-sans-semibold text-text-primary mb-2">Stock actual</Text>
        {stock.length === 0 ? (
          <Text className="font-sans text-text-tertiary mb-4">Todavía no agregaste ingredientes.</Text>
        ) : (
          stock.map((item) => (
            <Card key={item.id} className="mb-2 flex-row justify-between items-center">
              <Text className="font-sans text-text-primary">{item.ingredient_name}</Text>
              <Pressable accessibilityRole="button" onPress={() => removeIngredient(item.id)}>
                <Text className="text-danger font-sans-semibold">Eliminar</Text>
              </Pressable>
            </Card>
          ))
        )}

        <Pressable
          accessibilityRole="button"
          className="mb-6"
          onPress={() =>
            Alert.alert('Vaciar heladera', '¿Seguro que querés eliminar todo el stock?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Vaciar', style: 'destructive', onPress: () => clearStock(userId) },
            ])
          }
        >
          <Text className="font-sans text-danger text-center">Vaciar heladera</Text>
        </Pressable>

        <Text className="font-sans-semibold text-text-primary mb-2">¿Qué comés ahora?</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {MEAL_OPTIONS.map((m) => (
            <Pressable
              key={m.value}
              accessibilityRole="button"
              onPress={() => setMealType(m.value)}
              className={`rounded-full px-4 py-2 ${mealType === m.value ? 'bg-primary' : 'bg-surface border border-border'}`}
            >
              <Text className={mealType === m.value ? 'text-white font-sans-semibold' : 'text-text-secondary font-sans'}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button loading={loading} onPress={handleGenerate}>
          Generar receta
        </Button>

        {generated ? (
          <Card className="mt-6 mb-8">
            <Text className="font-display text-text-primary text-xl mb-2">{generated.name}</Text>
            <Text className="font-sans text-text-secondary text-sm mb-3">{generated.why}</Text>
            {generated.ingredients.map((ing, i) => (
              <Text
                key={i}
                className={`font-sans text-sm mb-1 ${ing.available ? 'text-success' : 'text-danger'}`}
              >
                {ing.available ? '✓' : '✗'} {ing.name} — {ing.quantity} {ing.unit}
              </Text>
            ))}
            <Text className="font-sans-semibold text-text-primary mt-3 mb-1">Preparación</Text>
            {generated.preparation.map((step, i) => (
              <Text key={i} className="font-sans text-text-secondary text-sm">
                {i + 1}. {step}
              </Text>
            ))}
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
