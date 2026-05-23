import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/stores/useUserStore';
import { usePantryStore, CATEGORY_LABELS, type PantryCategory } from '@/stores/usePantryStore';

const CATEGORIES: PantryCategory[] = [
  'protein',
  'vegetable',
  'fruit',
  'grain',
  'dairy',
  'legume',
  'supplement',
  'condiment',
  'other',
];

export default function PantryScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const profile = useUserStore((s) => s.profile);
  const userId = user?.id ?? profile?.id ?? '';
  const {
    items,
    shoppingItems,
    isLoading,
    isProcessingPhoto,
    loadItems,
    addManual,
    removeItem,
    processPhoto,
    loadShoppingSuggestions,
    regenerateShoppingList,
  } = usePantryStore();
  const [manualName, setManualName] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (userId) {
      loadItems(userId);
      loadShoppingSuggestions(userId);
    }
  }, [userId, loadItems, loadShoppingSuggestions]);

  const pickAndProcess = async (sourceType: 'pantry_photo' | 'receipt') => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso', 'Necesitamos acceso a la cámara para analizar tu alacena.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets[0]?.base64) return;

    const count = await processPhoto(userId, result.assets[0].base64, sourceType);
    Alert.alert(
      'Listo',
      sourceType === 'receipt'
        ? `Repusiste ${count} productos en tu alacena.`
        : `Se agregaron productos a tu alacena.`
    );
  };

  const grouped = CATEGORIES.reduce(
    (acc, cat) => {
      const list = items.filter((i) => (i.category ?? 'other') === cat);
      if (list.length) acc[cat] = list;
      return acc;
    },
    {} as Record<string, typeof items>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="px-4" keyboardShouldPersistTaps="handled">
        <Text className="font-display text-text-primary text-3xl mt-2 mb-4">Mi alacena</Text>

        <View className="flex-row gap-3 mb-4">
          <Pressable
            accessibilityRole="button"
            onPress={() => pickAndProcess('pantry_photo')}
            className="flex-1 bg-surface border border-border rounded-2xl p-4 items-center"
            disabled={isProcessingPhoto}
          >
            <Text className="text-3xl mb-2">📸</Text>
            <Text className="font-sans-semibold text-text-primary text-center">Foto de heladera</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => pickAndProcess('receipt')}
            className="flex-1 bg-surface border border-border rounded-2xl p-4 items-center"
            disabled={isProcessingPhoto}
          >
            <Text className="text-3xl mb-2">🧾</Text>
            <Text className="font-sans-semibold text-text-primary text-center">Ticket de super</Text>
          </Pressable>
        </View>

        {isProcessingPhoto ? (
          <View className="items-center py-4">
            <ActivityIndicator color="#5B4FCF" />
            <Text className="font-sans text-text-secondary mt-2">Analizando tu alacena...</Text>
          </View>
        ) : null}

        <View className="flex-row gap-2 mb-4">
          <Input
            className="flex-1"
            placeholder="Agregar manualmente..."
            value={manualName}
            onChangeText={setManualName}
          />
          <Button
            variant="secondary"
            onPress={async () => {
              if (!manualName.trim()) return;
              await addManual(userId, manualName.trim());
              setManualName('');
            }}
          >
            +
          </Button>
        </View>

        <Text className="font-sans-semibold text-text-primary mb-2">— Stock actual —</Text>
        {isLoading ? (
          <ActivityIndicator className="mb-4" />
        ) : Object.keys(grouped).length === 0 ? (
          <Text className="font-sans text-text-tertiary mb-6">Tu alacena está vacía. Sumá productos con una foto o manualmente.</Text>
        ) : (
          Object.entries(grouped).map(([cat, list]) => (
            <View key={cat} className="mb-2">
              <Pressable
                accessibilityRole="button"
                onPress={() => setExpanded((e) => ({ ...e, [cat]: !e[cat] }))}
                className="flex-row justify-between items-center py-2"
              >
                <Text className="font-sans-semibold text-text-primary">
                  {CATEGORY_LABELS[cat] ?? cat} ({list.length})
                </Text>
                <Ionicons
                  name={expanded[cat] !== false ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#5B4FCF"
                />
              </Pressable>
              {expanded[cat] !== false
                ? list.map((item) => (
                    <Card key={item.id} className="mb-1 flex-row justify-between items-center py-2">
                      <View>
                        <Text className="font-sans text-text-primary">{item.name}</Text>
                        {item.quantity ? (
                          <Text className="font-sans text-text-tertiary text-xs">{item.quantity}</Text>
                        ) : null}
                      </View>
                      <Pressable accessibilityRole="button" onPress={() => removeItem(item.id)}>
                        <Text className="text-danger font-sans text-sm">Quitar</Text>
                      </Pressable>
                    </Card>
                  ))
                : null}
            </View>
          ))
        )}

        <Text className="font-sans-semibold text-text-primary mt-4 mb-2">— Sugerencias de compra —</Text>
        <Card className="mb-3">
          <Text className="font-sans text-text-tertiary text-xs mb-2">Basado en tu alacena y perfil</Text>
          {shoppingItems.length === 0 ? (
            <Text className="font-sans text-text-secondary text-sm">Generá una lista inteligente con el botón de abajo.</Text>
          ) : (
            shoppingItems.slice(0, 5).map((s, i) => (
              <Text key={i} className="font-sans text-text-primary text-sm mb-1">
                · {s.name} — {s.reason}
              </Text>
            ))
          )}
        </Card>

        <Button
          variant="secondary"
          className="mb-3"
          onPress={() => regenerateShoppingList(userId)}
        >
          Actualizar sugerencias
        </Button>
        <Button className="mb-8" onPress={() => router.push('/pantry/shopping-list' as '/profile')}>
          Armar lista de super →
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
