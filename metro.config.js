const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const providerDir = path.resolve(__dirname, 'provider');
const rootPkgJson = path.resolve(__dirname, 'package.json');

// Packages that must resolve to a single instance from the root node_modules
// when bundling unified /partner routes from provider/ alongside src/.
const SINGLETON_PREFIXES = [
  'react',
  'react-dom',
  'react-native',
  'react-native-web',
  'expo',
  'expo-router',
  'expo-font',
  'expo-video',
  'expo-linear-gradient',
  'expo-constants',
  'expo-linking',
  'expo-asset',
  '@react-navigation/',
  'react-native-safe-area-context',
  'react-native-screens',
  'react-native-gesture-handler',
  'react-native-reanimated',
  'react-native-svg',
  'lucide-react-native',
  '@supabase/',
  '@react-native-async-storage/',
];

function isSingletonModule(moduleName) {
  return SINGLETON_PREFIXES.some(
    (prefix) =>
      moduleName === prefix ||
      (prefix.endsWith('/') ? moduleName.startsWith(prefix) : moduleName.startsWith(`${prefix}/`))
  );
}

const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const fromProvider =
    context.originModulePath &&
    (context.originModulePath === providerDir ||
      context.originModulePath.startsWith(providerDir + path.sep));

  const isBareImport =
    !moduleName.startsWith('.') && !moduleName.startsWith('/') && !path.isAbsolute(moduleName);

  if (fromProvider && isBareImport && isSingletonModule(moduleName)) {
    const rootContext = {
      ...context,
      originModulePath: rootPkgJson,
    };
    try {
      if (upstreamResolveRequest) {
        return upstreamResolveRequest(rootContext, moduleName, platform);
      }
      return context.resolveRequest(rootContext, moduleName, platform);
    } catch {
      // Fall back to default resolution below if not found in root
    }
  }

  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
