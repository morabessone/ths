import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import type { EducationVideo } from '@/types/education.types';

interface PremiumVideoSheetProps {
  video: EducationVideo | null;
  sheetRef: React.RefObject<BottomSheet | null>;
}

export function PremiumVideoSheet({ video, sheetRef }: PremiumVideoSheetProps) {
    const router = useRouter();
    const snapPoints = useMemo(() => ['55%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      []
    );

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <View className="px-6 pb-8">
          <Text className="font-display text-text-primary text-xl mb-2">Contenido exclusivo</Text>
          {video?.description ? (
            <Text className="font-sans text-text-secondary text-sm mb-4">{video.description}</Text>
          ) : (
            <Text className="font-sans text-text-secondary text-sm mb-4">
              Este video es parte del catálogo Premium de LivIn.
            </Text>
          )}
          <Text className="font-sans-semibold text-text-primary mb-2">Con Premium obtenés:</Text>
          {[
            'Acceso a todos los videos exclusivos',
            'Micros completos y estudios médicos',
            'Sincronización con wearables',
          ].map((item) => (
            <Text key={item} className="font-sans text-text-secondary text-sm mb-1">
              · {item}
            </Text>
          ))}
          <Button
            className="mt-6"
            onPress={() => {
              sheetRef.current?.close();
              router.push('/profile');
            }}
          >
            Ver planes
          </Button>
        </View>
      </BottomSheet>
    );
}
