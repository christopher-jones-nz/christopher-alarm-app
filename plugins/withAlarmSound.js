const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withAlarmSound(config) {
  return withDangerousMod(config, [
    "android",
    async (cfg) => {
      const src = path.join(
        cfg.modRequest.projectRoot,
        "assets",
        "sounds",
        "alarm.mp3",
      );
      const destDir = path.join(
        cfg.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "raw",
      );
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(
        src,
        path.join(destDir, "stan-walker-mo-ake-tonu-18s.mp3"),
      );
      return cfg;
    },
  ]);
};
