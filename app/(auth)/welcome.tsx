import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg px-6 justify-center">
      <Animated.View entering={FadeInDown.delay(100).duration(600)}>
        <Text className="font-display-bold text-primary text-5xl text-center mb-2">LivIn</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(300).duration(600)}>
        <Text className="font-sans text-text-secondary text-lg text-center mb-12 leading-7">
          Entendé tu cuerpo.{'\n'}No solo contés calorías.
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(500).duration(600)} className="gap-3">
        <Link href="/(auth)/onboarding/step-1-biometrics" asChild>
          <Button>Empezar</Button>
        </Link>
        <Link href="/(auth)/login" asChild>
          <Button variant="ghost">Ya tengo cuenta</Button>
        </Link>
      </Animated.View>
    </SafeAreaView>
  );
}
