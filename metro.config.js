const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurar para evitar problemas con TypeScript en node_modules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Ignorar archivos de Next.js que causan conflictos
config.resolver.blockList = [
  new RegExp('/app/layout\\.tsx$'),
  new RegExp('/app/page\\.tsx$'),
  new RegExp('/app/globals\\.css$'),
];

module.exports = config;
