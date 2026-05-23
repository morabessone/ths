const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Expo Go cannot load Nitro native modules (HealthKit / Health Connect).
// Set EXPO_PUBLIC_ENABLE_NATIVE_HEALTH=true in .env.local when using `expo run:ios|android`.
const nativeHealthEnabled = process.env.EXPO_PUBLIC_ENABLE_NATIVE_HEALTH === 'true';

if (!nativeHealthEnabled) {
  const healthkitMock = path.resolve(__dirname, 'lib/health/mocks/healthkit.ts');
  const healthConnectMock = path.resolve(__dirname, 'lib/health/mocks/healthConnect.ts');

  const originalResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === '@kingstinct/react-native-healthkit') {
      return { type: 'sourceFile', filePath: healthkitMock };
    }
    if (moduleName === 'react-native-health-connect') {
      return { type: 'sourceFile', filePath: healthConnectMock };
    }
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = withNativeWind(config, { input: './global.css' });
