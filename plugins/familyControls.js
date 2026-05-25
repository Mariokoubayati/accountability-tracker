const { withEntitlementsPlist, withInfoPlist, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

module.exports = function withFamilyControls(config) {
  // Add Family Controls entitlement
  config = withEntitlementsPlist(config, (c) => {
    c.modResults['com.apple.developer.family-controls'] = true;
    return c;
  });

  // Copy Swift module files into iOS project after prebuild
  config = withDangerousMod(config, [
    'ios',
    async (c) => {
      const projectRoot = c.modRequest.projectRoot;
      const iosRoot = path.join(projectRoot, 'ios');
      const moduleSrc = path.join(projectRoot, 'modules', 'FamilyControls', 'ios');
      const moduleDest = path.join(iosRoot, 'FamilyControlsModule');

      if (fs.existsSync(moduleSrc)) {
        if (!fs.existsSync(moduleDest)) fs.mkdirSync(moduleDest, { recursive: true });
        const files = fs.readdirSync(moduleSrc);
        for (const file of files) {
          fs.copyFileSync(
            path.join(moduleSrc, file),
            path.join(moduleDest, file)
          );
        }
      }
      return c;
    },
  ]);

  return config;
};
