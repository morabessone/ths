import { useState } from 'react';
import { Text, View, Pressable, Platform } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDayPlanStore } from '@/stores/useDayPlanStore';

interface HealthConnectSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  userId: string;
  onClose?: () => void;
}

export function HealthConnectSheet({ sheetRef, userId }: HealthConnectSheetProps) {
  const syncHealth = useDayPlanStore((s) => s.syncWearableFromHealth);
  const saveManual = useDayPlanStore((s) => s.saveManualActivity);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [steps, setSteps] = useState('');
  const [sleep, setSleep] = useState('');
  const [trained, setTrained] = useState(false);

  const healthLabel = Platform.OS === 'ios' ? 'Apple Salud' : 'Health Connect';
  const connectLabel = `Conectar ${healthLabel}`;

  const handleConnect = async () => {
    setLoading(true);
    setMessage(null);
    const res = await syncHealth(userId);
    setLoading(false);
    setMessage(res.ok ? 'Datos sincronizados. Plan actualizado.' : res.message ?? 'Error al conectar');
    if (res.ok) sheetRef.current?.close();
  };

  const handleManual = async () => {
    setLoading(true);
    await saveManual(userId, {
      steps: steps ? Number(steps) : undefined,
      sleep_hours: sleep ? Number(sleep) : undefined,
      training_detected: trained,
      training_type: trained ? 'mixed' : undefined,
      calories_burned: trained ? 350 : undefined,
    });
    setLoading(false);
    sheetRef.current?.close();
  };

  return (
    <BottomSheet ref={sheetRef} index={-1} snapPoints={['75%']} enablePanDownToClose>
      <BottomSheetScrollView className="px-6 pb-8">
        <Text className="font-display text-text-primary text-xl mb-2">Actividad y sueño</Text>
        <Text className="font-sans text-text-secondary text-sm mb-4">
          LivIn ajusta calorías, hidratos y timing según lo que registrás en {healthLabel} o de forma
          manual. No hace falta anotar comidas.
        </Text>

        <Button loading={loading} onPress={handleConnect} className="mb-3">
          {connectLabel}
        </Button>

        <Text className="font-sans-semibold text-text-primary mt-4 mb-2">Registro manual</Text>
        <Input
          label="Pasos hoy"
          keyboardType="numeric"
          value={steps}
          onChangeText={setSteps}
          placeholder="Ej. 8500"
        />
        <Input
          label="Horas de sueño"
          keyboardType="decimal-pad"
          value={sleep}
          onChangeText={setSleep}
          placeholder="Ej. 7.5"
        />
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: trained }}
          onPress={() => setTrained(!trained)}
          className="flex-row items-center mb-4"
        >
          <View
            className={`w-5 h-5 rounded border mr-2 items-center justify-center ${
              trained ? 'bg-primary border-primary' : 'border-border'
            }`}
          >
            {trained ? <Text className="text-white text-xs">✓</Text> : null}
          </View>
          <Text className="font-sans text-text-primary">Entrené hoy</Text>
        </Pressable>

        <Button variant="secondary" loading={loading} onPress={handleManual}>
          Guardar y actualizar plan
        </Button>

        {message ? (
          <Text className="font-sans text-text-secondary text-sm mt-4">{message}</Text>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
