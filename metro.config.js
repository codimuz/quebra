const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    unstable_enableSymlinks: false,
  },
  watchFolders: [],
  resetCache: true,
};

module.exports = config;
