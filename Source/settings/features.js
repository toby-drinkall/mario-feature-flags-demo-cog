// Feature Flags Configuration
// These flags control new features that can be toggled or removed

FullScreenMario.FullScreenMario.settings.features = {
    // Feature Flag 1: Enhanced Jump Physics v2
    // Status: ACTIVE (new implementation enabled)
    // Files affected: settings/math.ts, settings/objects.js
    // Description: Improved jump physics with momentum-based calculations
    useEnhancedJumpPhysics: true,

    // Feature Flag 2: Fast Running Speed
    // Status: ACTIVE (new speed enabled)
    // Files affected: settings/objects.js, settings/math.ts
    // Description: Increases Mario's running speed by 25%
    useFastRunning: true
};
