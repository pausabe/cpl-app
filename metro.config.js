const defaultAssetExts = require("metro-config/src/defaults/defaults").assetExts;

module.exports = {
  resolver: {
    assetExts: [
      ...defaultAssetExts,
      // 3D Model formats
      "dae",
      "obj",
      "mtl",
      // sqlite format
      "db",
      "sqlite"
    ]
  }
};