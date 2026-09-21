const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('db');
config.resolver.assetExts.push("ttf");
// El motor d'expo-sqlite al navegador
config.resolver.assetExts.push('wasm');

// react-native-youtube-iframe demana react-native-web-webview al web i no el tenim: sense aquest
// buit, la compilació web falla. Al navegador la Missa es queda sense el vídeo.
const defaultResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-web-webview') {
    return { type: 'empty' };
  }
  return (defaultResolve || context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
