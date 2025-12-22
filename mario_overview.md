# FullScreenMario Codebase Overview
## Comprehensive Guide for Feature Flag Implementation & Modification

---

## TABLE OF CONTENTS

1. [Quick Reference](#quick-reference)
2. [Architecture Overview](#architecture-overview)
3. [Game Loop & Update Cycle](#game-loop--update-cycle)
4. [Core Systems](#core-systems)
5. [Mod System (Feature Flags)](#mod-system-feature-flags)
6. [Settings Files Reference](#settings-files-reference)
7. [Entry Points & Initialization](#entry-points--initialization)
8. [Thing System (Game Objects)](#thing-system-game-objects)
9. [How to Add/Remove/Toggle Features](#how-to-addremovetoggle-features)
10. [Key File Locations](#key-file-locations)

---

## QUICK REFERENCE

### Project Structure
```
/Users/tobydrinkall/dev-mario/
├── Source/
│   ├── FullScreenMario.ts         (8,952 lines - Main game logic)
│   ├── FullScreenMario.js         (310KB - Compiled game)
│   ├── index.html                 (Entry HTML)
│   ├── index.js                   (15 lines - Initialization)
│   ├── index.css                  (Styling)
│   ├── References/                (26 framework modules)
│   │   ├── ModAttachr-0.2.2.js   (Feature flag system!)
│   │   ├── GameStartr-0.2.0.js   (Game engine base)
│   │   ├── AudioPlayr-0.2.1.js   (Audio system)
│   │   └── ... (23 more modules)
│   └── settings/                  (Configuration files)
│       ├── mods.js               (735 lines - Feature definitions)
│       ├── ui.js                 (402 lines - Menu system)
│       ├── objects.js            (34,703 lines - Thing classes)
│       ├── maps.js               (243,764 lines - All levels)
│       ├── sprites.js            (115,972 lines - Graphics)
│       ├── audio.js              (Sound library)
│       ├── input.js              (Key mappings)
│       ├── collisions.js         (Collision config)
│       └── ... (11 more settings)
├── Distribution/                  (Built versions)
└── package.json                  (Dependencies)
```

### Key Constants
```javascript
unitsize = 4              // 4 pixels = 1 game unit
scale = 2                 // Display scaling
gravity = 0.48            // Gravity acceleration per frame
framerate = 60            // Target FPS
```

---

## ARCHITECTURE OVERVIEW

### Class Hierarchy
```
EightBittr (Base for 8-bit games)
  └── GameStartr (Game engine framework)
      └── FullScreenMario (Super Mario implementation)
```

### Framework Modules (26 Total)

Located in: `Source/References/`

**Critical Modules:**
1. **ModAttachr** - Feature flag/mod system (PRIMARY for your use case!)
2. **GamesRunnr** - Game loop management
3. **ObjectMakr** - Thing instantiation
4. **GroupHoldr** - Thing grouping (Character, Solid, Scenery, Text)
5. **ThingHittr** - Collision detection
6. **QuadsKeepr** - Spatial grid for collision optimization
7. **MapsHandler** - Level loading and spawning
8. **InputWritr** - Keyboard/controller input
9. **AudioPlayr** - Sound system
10. **UserWrappr** - UI and menu system

**Support Modules:**
- ChangeLinr, DeviceLayr, FPSAnalyzr, ItemsHoldr, LevelEditr
- MapsCreatr, MapScreenr, MathDecidr, NumberMakr, PixelDrawr
- PixelRendr, ScenePlayr, StringFilr, TimeHandlr, TouchPassr, WorldSeedr

### How Modules Interact
```
User Input → InputWritr → FullScreenMario methods
                            ↓
GamesRunnr (60fps) → maintain functions → Thing.movement()
                            ↓
QuadsKeepr → ThingHittr → collision handlers
                            ↓
PixelDrawr → Canvas rendering
```

---

## GAME LOOP & UPDATE CYCLE

### Runner Configuration
**File:** `Source/settings/runner.js`

**7 Functions Run Every Frame (60 FPS):**

```javascript
games: [
    // 1. Check gamepad input
    function() {
        this.DeviceLayer.checkNavigatorGamepads();
        this.DeviceLayer.activateAllGamepadTriggers();
    },

    // 2. Update Scenery and Text quadrants
    function() {
        this.QuadsKeeper.determineAllQuadrants("Scenery", this.GroupHolder.getSceneryGroup());
        this.QuadsKeeper.determineAllQuadrants("Text", this.GroupHolder.getTextGroup());
    },

    // 3. Maintain Solids (blocks, platforms)
    function() {
        this.maintainSolids(this, this.GroupHolder.getSolidGroup());
    },

    // 4. Maintain Characters (enemies, items, player physics)
    function() {
        this.maintainCharacters(this, this.GroupHolder.getCharacterGroup());
    },

    // 5. Maintain Player (scrolling, death checks)
    function() {
        this.maintainPlayer(this, this.player);
    },

    // 6. Handle timed events
    function() {
        this.TimeHandler.handleEvents();
    },

    // 7. Render frame
    function() {
        this.PixelDrawer.refillGlobalCanvas(this.MapsHandler.getArea().background);
    }
]
```

### Maintain Functions

**Location:** `Source/FullScreenMario.ts`

**maintainSolids** (line ~894):
- Updates quadrant positions
- Calls movement function if solid has one
- Removes off-screen solids

**maintainCharacters** (line ~925):
- Applies gravity to all non-resting characters
- Updates x/y positions based on velocity
- Determines quadrants for collision
- Runs collision detection (`ThingHitter.checkHitsOf`)
- Handles overlapping when stuck
- Verifies resting state
- Calls Thing.movement() or removes dead Things

**maintainPlayer** (line ~1098):
- Checks falling/jumping state
- Handles death from falling off screen
- Manages screen scrolling (when moving right)
- Prevents moving off left edge
- Tracks jump state

---

## CORE SYSTEMS

### 1. Physics System

**Gravity:**
```javascript
gravity = Math.round(12 * unitsize) / 100  // ~0.48
underwaterGravity = gravity / 2.8          // ~0.17
```

**Applied in:** `maintainCharacters` every frame to non-resting Things

**Velocity Limits:**
```javascript
maxYVelocity = unitsize * 2  // Terminal velocity
maxXVelocity = unitsize * 4  // Max horizontal speed (varies by character)
```

**Resting State:**
When `Thing.resting` is set, gravity is not applied (standing on ground/platform)

### 2. Collision System

**File:** `Source/settings/collisions.js`

**Group Configuration:**
```javascript
groupNames: ["Solid", "Character"]
keyGroupName: "groupType"
```

**Collision Checks:**
- Character vs Character (player hitting enemy)
- Character vs Solid (landing on platform)

**Hit Functions:**
- `generateHitCharacterSolid` - Landing, hitting blocks
- `generateHitCharacterCharacter` - Player/enemy interactions

**Spatial Optimization:**
- Screen divided into quadrants (grid cells)
- Only Things in same quadrant check collisions
- Configured in `Source/settings/quadrants.js`

### 3. Input System

**File:** `Source/settings/input.js`

**Key Mappings:**
```javascript
aliases: {
    "left":   [65, 37],      // A, Left Arrow
    "right":  [68, 39],      // D, Right Arrow
    "up":     [87, 38, 32],  // W, Up Arrow, Space
    "down":   [83, 40],      // S, Down Arrow
    "sprint": [16, 17],      // Shift, Ctrl
    "pause":  [80],          // P
    "mute":   [77],          // M
    "q":      [81]           // Q (used by some mods)
}
```

**Handler Functions:**
Each key has:
- `keyDownLeft()` - Pressed handler
- `keyUpLeft()` - Released handler
- ModAttacher events fired for each input

**Device Motion:**
Supports device tilt via `deviceMotion` events (for mobile)

### 4. Audio System

**File:** `Source/settings/audio.js`

**Structure:**
```javascript
library: {
    Sounds: [
        "Break Block", "Coin", "Fireball", "Flagpole",
        "Jump Small", "Jump Super", "Kick", "Pause",
        "Powerup", "Powerup Appears", "Vine Emerging", etc.
    ],
    Themes: [
        "Castle", "Overworld", "Underwater", "Underworld",
        "Star", "Sky", "Hurry" variants
    ]
}
```

**Features:**
- Multiple formats (mp3, ogg, wav)
- Volume control
- Theme switching per area
- Hurry music when time < 100

**Usage:**
```javascript
FSM.AudioPlayer.play("Coin");
FSM.AudioPlayer.playTheme("Overworld");
```

### 5. Rendering System

**Sprites:** `Source/settings/sprites.js` (115,972 lines!)

**Render Groups (bottom to top):**
1. Scenery (clouds, bushes, backgrounds)
2. Solid (blocks, platforms, pipes)
3. Character (enemies, items, player)
4. Text (HUD, score popups)

**Sprite Key Computation:**
Composed from: `area + title + groupType + className`

**Example:**
```javascript
// A Goomba in Overworld
key = "Overworld character goomba"

// Changes sprite automatically when className changes
thing.className = "dead";  // Updates sprite to dead version
```

**Custom Pixel Format:**
Sprites stored as arrays of palette indices, converted to RGBA at runtime

### 6. Map System

**File:** `Source/settings/maps.js` (243,764 lines!)

**Structure:**
```javascript
{
    "1-1": {
        "name": "World 1-1",
        "locations": [
            { "area": 0, "entry": "Normal" },
            { "area": 1, "entry": "PipeVertical" }  // Underground
        ],
        "areas": [
            {
                "setting": "Overworld",
                "creation": [
                    { "thing": "Block", "x": 256, "y": 64 },
                    { "thing": "Goomba", "x": 320, "y": 8 }
                ]
            }
        ]
    }
}
```

**Map Coordinates:**
- X: Distance from left (pixels)
- Y: Height above floor (game units, NOT pixels from top!)

**Entrances:**
- Normal, Plain, Walking (standard)
- Castle (door entry)
- PipeVertical, PipeHorizontal
- Vine (climbing)

**Macros:**
Reusable patterns: Floor, Pipe, Tree, Bridge, PlatformGenerator, etc.

**Loading Process:**
```javascript
FSM.setMap("1-1", 0);
// 1. MapsCreator parses JSON
// 2. Area settings applied
// 3. Entrance function called
// 4. PreThings created
// 5. Things spawned as player scrolls
```

---

## MOD SYSTEM (FEATURE FLAGS)

### ModAttachr - THE PRIMARY FEATURE FLAG SYSTEM

**File:** `Source/References/ModAttachr-0.2.2.js`
**Definitions:** `Source/settings/mods.js`

This is the built-in, fully functional feature flag system!

### Mod Structure

```javascript
{
    "name": "Mod Name",
    "description": "Description of what it does",
    "author": {
        "name": "Author Name",
        "email": "email@example.com"
    },
    "enabled": false,  // Default state
    "events": {
        // Called when mod is enabled
        "onModEnable": function(mod) {
            // Enable feature logic
        },

        // Called when mod is disabled
        "onModDisable": function(mod) {
            // Disable feature logic
        },

        // Hook into game events
        "onSetLocation": function(mod) { },
        "onPlayerLanding": function(mod) { },
        "onKeyDownLeft": function(mod) { },
        // ... many more events
    },
    "settings": {
        // Mod-specific persistent state
    }
}
```

### Available Event Hooks (26+ total)

**Mod Lifecycle:**
- `onModEnable` - Mod turned on
- `onModDisable` - Mod turned off

**Game Lifecycle:**
- `onGameStart` - Game initialized
- `onGameOver` - Game over
- `onGamePause` - Paused
- `onGamePlay` - Resumed

**Map Events:**
- `onPreSetLocation` - Before map loads
- `onSetLocation` - Map loaded

**Thing Events:**
- `onAddThing` - Any Thing added
- `onAddPlayer` - Player spawned

**Player Events:**
- `onPlayerLanding` - Player lands on ground
- `onPlayerDeath` - Player dies
- `onPlayerRespawn` - Player respawns

**Input Events:**
- `onKeyDownLeft`, `onKeyDownRight`, `onKeyDownUp`, `onKeyDownDown`
- `onKeyDownSprint`, `onKeyDownPause`, `onKeyDownMute`
- `onKeyUpLeft`, `onKeyUpRight`, `onKeyUpUp`, `onKeyUpDown`
- `onKeyUpSprint`
- `onDeviceMotion` - Device tilt

**Scroll Events:**
- `onScrollPlayer` - Screen scrolls

### Existing Mods (Examples)

**File:** `Source/settings/mods.js` (735 lines)

1. **Bouncy Bounce** - Player bounces on landing
2. **Dark is the Night** - Dark theme visual
3. **Earthquake!** - Landing shakes everything
4. **Gradient Skies** - Gradient backgrounds
5. **Hard Mode** - Replaces Goombas with Beetles, faster enemies
6. **High Speed** - 14x player speed
7. **Infinite Lives** - Lives never decrease
8. **Invincibility** - Permanent star power
9. **Parallax Clouds** - Clouds scroll at 70% speed
10. **Low Gravity** - Reduced gravity
11. **Luigi** - Play as Luigi instead of Mario
12. **Palette Swap** - Random color palettes
13. **QCount** - Spawn enemies on Q key
14. **Super Fireballs** - Fireballs destroy blocks
15. **Trip of Acid** - Screen trails effect

### How Mods Work

**Enabling a Mod:**
```javascript
FSM.ModAttacher.enableMod("ModName");
// 1. Sets mod.enabled = true
// 2. Stores in ItemsHolder (localStorage)
// 3. Fires onModEnable event
// 4. Mod persists across page reloads
```

**Disabling a Mod:**
```javascript
FSM.ModAttacher.disableMod("ModName");
// 1. Sets mod.enabled = false
// 2. Updates localStorage
// 3. Fires onModDisable event
```

**Firing Events:**
Throughout `FullScreenMario.ts`:
```javascript
this.ModAttacher.fireEvent("onPlayerLanding", this.player);
// Calls all enabled mods' onPlayerLanding handlers
```

**Checking if Mod Enabled:**
```javascript
if (FSM.ModAttacher.getMod("ModName").enabled) {
    // Do something
}
```

### State Persistence

**Uses ItemsHolder + localStorage:**
```javascript
"storeLocally": true  // Saves enabled state to browser
```

Mods auto-enable on page load if previously enabled.

### UI Integration

Mods appear in game menu automatically when defined in `mods.js`

---

## SETTINGS FILES REFERENCE

**Location:** `Source/settings/`

### Complete List

| File | Size | Purpose |
|------|------|---------|
| **mods.js** | 735 lines | Feature flag definitions |
| **ui.js** | 402 lines | Menu system schemas |
| **objects.js** | 34,703 lines | Thing class hierarchy & properties |
| **maps.js** | 243,764 lines | All 32 levels + patterns |
| **sprites.js** | 115,972 lines | Sprite pixel data |
| **generator.js** | 149,753 lines | Procedural generation rules |
| **editor.js** | 337 lines | Level editor configuration |
| **audio.js** | 50 lines | Sound/music library |
| **input.js** | 42 lines | Key mappings |
| **runner.js** | 33 lines | Game loop functions |
| **collisions.js** | 21 lines | Collision system config |
| **groups.js** | 5 lines | Thing group names |
| **quadrants.js** | ~50 lines | Collision grid settings |
| **renderer.js** | ~100 lines | Render configuration |
| **scenes.js** | ~200 lines | Cutscene definitions |
| **statistics.js** | ~150 lines | Score/lives tracking |
| **touch.js** | ~100 lines | Touch control config |
| **devices.js** | ~50 lines | Gamepad configuration |
| **events.js** | ~30 lines | Event handler config |
| **math.js** | ~50 lines | Math computation settings |

### How Settings Load

**Static Assignment:**
```javascript
// In each settings/*.js file:
FullScreenMario.FullScreenMario.settings.{name} = { ... };
```

**Usage in Reset Functions:**
```typescript
// In FullScreenMario.ts
resetAudioPlayer(FSM, settings) {
    FSM.AudioPlayer = new AudioPlayr(FSM.settings.audio);
}
```

All settings load before game starts during initialization.

---

## ENTRY POINTS & INITIALIZATION

### Main Entry Point

**File:** `Source/index.js` (15 lines)

```javascript
document.onreadystatechange = function (event) {
    if (event.target.readyState !== "complete") return;

    // Create UserWrapper (UI system)
    var UserWrapper = new UserWrappr.UserWrappr(
        FullScreenMario.FullScreenMario.prototype.proliferate({
            "GameStartrConstructor": FullScreenMario.FullScreenMario
        }, FullScreenMario.FullScreenMario.settings.ui, true)
    );

    // Show help menu (Options > Mods screen)
    UserWrapper.displayHelpMenu();
};
```

### Constructor Flow

**File:** `Source/FullScreenMario.ts` (lines 127-152)

```typescript
constructor(settings: GameStartr.IGameStartrSettings) {
    // Load settings
    this.settings = FullScreenMario.settings;

    // Initialize device motion
    this.deviceMotionStatus = {
        motionLeft: false,
        motionRight: false,
        x: undefined,
        y: undefined
    };

    // Call parent constructor with merged settings
    super(this.proliferate({
        "constantsSource": FullScreenMario,
        "constants": ["unitsize", "scale", "gravity", "pointLevels", "customTextMappings"]
    }, settings));
}
```

### Reset Functions (Initialization Order)

**Called in FullScreenMario.ts:**

1. `resetObjectMaker` - Create Thing class system
2. `resetPixelRender` - Sprite rendering setup
3. `resetTimeHandler` - Event timing system
4. `resetAudioPlayer` - Sound initialization
5. `resetQuadsKeeper` - Collision grid
6. `resetGamesRunner` - Game loop setup
7. `resetGroupHolder` - Thing group arrays
8. `resetThingHitter` - Collision detection
9. `resetMapScreener` - Screen boundaries
10. `resetPixelDrawer` - Canvas drawing
11. `resetNumberMaker` - Random number generator
12. `resetMapsCreator` - Map JSON parser
13. `resetMapsHandler` - Map spawning
14. `resetInputWriter` - Input handling
15. `resetDeviceLayer` - Gamepad support
16. `resetTouchPasser` - Touch controls
17. `resetLevelEditor` - Editor features
18. `resetWorldSeeder` - Procedural generation
19. `resetScenePlayer` - Cutscene system
20. `resetMathDecider` - Math computations
21. **`resetModAttacher` - Mod/feature flag system**
22. `resetContainer` - DOM element setup

**Startup Time:** 500-700ms on modern hardware

---

## THING SYSTEM (GAME OBJECTS)

### Base Hierarchy

**File:** `Source/settings/objects.js` (34,703 lines)

```
Thing (base class)
├── character
│   ├── Player
│   ├── enemy
│   │   ├── Goomba
│   │   ├── Koopa
│   │   ├── Bowser
│   │   ├── Beetle
│   │   └── ... (20+ enemy types)
│   └── item
│       ├── Mushroom
│       ├── FireFlower
│       ├── Star
│       ├── Coin
│       └── ... (10+ item types)
├── solid
│   ├── Block
│   ├── Brick
│   ├── Pipe
│   ├── Platform
│   ├── Floor
│   └── ... (30+ solid types)
├── scenery
│   ├── Cloud
│   ├── Bush
│   ├── Tree
│   ├── Castle
│   └── ... (20+ scenery types)
└── text
    ├── Score popups
    └── HUD elements
```

### Thing Properties

**Every Thing has:**
```javascript
{
    // Position
    top: Number,
    right: Number,
    bottom: Number,
    left: Number,

    // Size
    width: Number,
    height: Number,

    // Velocity
    xvel: Number,      // Horizontal velocity
    yvel: Number,      // Vertical velocity
    speed: Number,     // Base speed

    // State
    alive: Boolean,
    dead: Boolean,
    nocollide: Boolean,  // Disable collision

    // Grouping
    groupType: String,   // "character", "solid", "scenery", "text"
    title: String,       // "Goomba", "Block", etc.
    className: String,   // For sprite variations

    // Callbacks
    movement: Function,  // Called every frame
    onMake: Function,    // Called when created
    death: Function,     // Called on death
    collide: Function,   // Collision handler

    // Rendering
    sprite: Object,
    spriteType: String,
    opacity: Number,
    scale: Number,
    hidden: Boolean,

    // Physics
    resting: Thing|undefined,  // What Thing is standing on
    tolx: Number,              // X collision tolerance
    toly: Number,              // Y collision tolerance

    // Custom properties per Thing type...
}
```

### Creating Things

**ObjectMakr API:**
```javascript
// Create a Thing
var thing = FSM.ObjectMaker.make("Goomba", {
    "smart": true,           // Smart AI
    "xvel": FSM.unitsize     // Moving right
});

// Add to game at position
FSM.addThing(thing, x, y);

// Or use shorthand
FSM.addThing("Goomba", 320, 8);
```

### Group Management

**GroupHoldr API:**
```javascript
// Get all Things in a group
FSM.GroupHolder.getCharacterGroup();  // All characters
FSM.GroupHolder.getSolidGroup();      // All solids
FSM.GroupHolder.getSceneryGroup();    // All scenery
FSM.GroupHolder.getTextGroup();       // All text

// Access by index
FSM.GroupHolder.getCharacter(0);  // First character (usually player)
```

---

## HOW TO ADD/REMOVE/TOGGLE FEATURES

### Method 1: Add New Mod (Recommended)

**File:** `Source/settings/mods.js`

**Template:**
```javascript
{
    "name": "My Feature Name",
    "description": "Description of what this feature does",
    "author": {
        "name": "Your Name",
        "email": "your@email.com"
    },
    "enabled": false,  // Default off
    "events": {
        "onModEnable": function(mod) {
            // Code to enable the feature
            var FSM = mod.game;

            // Example: Store original value
            mod.settings.originalGravity = FSM.gravity;

            // Example: Modify game behavior
            FSM.gravity = FSM.gravity * 0.5;
        },

        "onModDisable": function(mod) {
            // Code to disable the feature
            var FSM = mod.game;

            // Example: Restore original value
            FSM.gravity = mod.settings.originalGravity;
        },

        // Hook into events as needed
        "onPlayerLanding": function(mod, player) {
            // Example: Do something when player lands
        },

        "onKeyDownUp": function(mod) {
            // Example: Modify jump behavior
        }
    },
    "settings": {
        // Persistent state for this mod
    }
}
```

**Steps:**
1. Add mod object to `FullScreenMario.FullScreenMario.settings.mods.mods` array
2. No compilation needed (JavaScript)
3. Mod appears in game menu automatically
4. State persists in localStorage

### Method 2: Modify Existing Mod

**File:** `Source/settings/mods.js`

Find existing mod by name:
```javascript
{
    "name": "Infinite Lives",
    "description": "Player can't lose lives",
    // ... modify events or settings
}
```

**Common Modifications:**
- Change `enabled: false` to `enabled: true` for default-on
- Add new event hooks
- Modify behavior in event functions
- Add settings for configuration

### Method 3: Remove/Disable Mod

**Option A: Remove from Array**
Delete mod object from `mods.js`

**Option B: Make Non-Toggleable**
```javascript
{
    "name": "My Feature",
    "enabled": true,  // Always on
    // Remove events or make onModDisable empty
}
```

**Option C: Condition in Code**
```javascript
"onModEnable": function(mod) {
    // Feature permanently enabled, can't be toggled
    mod.enabled = true;
}
```

### Method 4: Add Feature to Core (TypeScript)

**File:** `Source/FullScreenMario.ts`

**Example: Add feature flag property**
```typescript
public featureName: boolean = false;
```

**Modify behavior based on flag:**
```typescript
maintainPlayer(FSM: FullScreenMario, player: IPlayer): void {
    if (this.featureName) {
        // Modified behavior
    } else {
        // Original behavior
    }
}
```

**Requires compilation:**
```bash
npm install
npx grunt
```

### Method 5: Settings-Based Toggle

**File:** `Source/settings/objects.js`

**Add property to Thing definition:**
```javascript
"Player": {
    "featureEnabled": false,
    // ... other properties
}
```

**Access in code:**
```javascript
if (player.featureEnabled) {
    // Do something
}
```

### Method 6: UI Option Toggle

**File:** `Source/settings/ui.js`

**Add to options schema:**
```javascript
{
    "title": "Feature Name",
    "type": "Boolean",
    "storeLocally": true,
    "source": function(GameStarter) {
        return GameStarter.ItemsHolder.getItem("featureName");
    },
    "enable": function(GameStarter) {
        GameStarter.ItemsHolder.setItem("featureName", true);
        // Enable feature logic
    },
    "disable": function(GameStarter) {
        GameStarter.ItemsHolder.setItem("featureName", false);
        // Disable feature logic
    }
}
```

### Examples of Feature Patterns

**Pattern 1: Modify Constant**
```javascript
"onModEnable": function(mod) {
    mod.settings.originalGravity = mod.game.gravity;
    mod.game.gravity = mod.game.gravity * 0.5;  // Half gravity
},
"onModDisable": function(mod) {
    mod.game.gravity = mod.settings.originalGravity;
}
```

**Pattern 2: Override Function**
```javascript
"onModEnable": function(mod) {
    mod.settings.originalFunction = mod.game.killPlayer;
    mod.game.killPlayer = function() {};  // Can't die
},
"onModDisable": function(mod) {
    mod.game.killPlayer = mod.settings.originalFunction;
}
```

**Pattern 3: Event-Based Toggle**
```javascript
"onKeyDownUp": function(mod) {
    var player = mod.game.player;
    if (mod.enabled) {
        player.yvel = mod.game.unitsize * -10;  // Super jump
    }
}
```

**Pattern 4: Visual Modification**
```javascript
"onModEnable": function(mod) {
    var FSM = mod.game;
    FSM.container.style.filter = "grayscale(100%)";
},
"onModDisable": function(mod) {
    mod.game.container.style.filter = "";
}
```

**Pattern 5: Thing Property Change**
```javascript
"onAddThing": function(mod, thing) {
    if (thing.title === "Goomba") {
        thing.speed = thing.speed * 2;  // Faster Goombas
    }
}
```

---

## KEY FILE LOCATIONS

### Files You'll Modify Most

**For Feature Flags:**
- `Source/settings/mods.js` - Add/modify/remove mods (735 lines)
- `Source/settings/ui.js` - UI options (402 lines)

**For Game Logic:**
- `Source/FullScreenMario.ts` - Core game code (8,952 lines)
  - Requires TypeScript compilation: `npx grunt`
- `Source/FullScreenMario.js` - Compiled output (310KB)

**For Configuration:**
- `Source/settings/objects.js` - Thing properties (34,703 lines)
- `Source/settings/maps.js` - Level data (243,764 lines)
- `Source/settings/input.js` - Key mappings (42 lines)
- `Source/settings/audio.js` - Sound library (50 lines)

**For References:**
- `Source/References/ModAttachr-0.2.2.js` - Feature flag system
- `Source/References/GameStartr-0.2.0.js` - Game engine base

**Entry Point:**
- `Source/index.html` - HTML page
- `Source/index.js` - JavaScript initialization (15 lines)

### Full File Tree

```
Source/
├── FullScreenMario.ts (8,952 lines)
├── FullScreenMario.d.ts (Type definitions)
├── FullScreenMario.js (310KB - compiled)
├── index.html
├── index.js (15 lines)
├── index.css
├── Fonts/
├── Sounds/
├── Theme/
├── References/
│   ├── AudioPlayr-0.2.1.js
│   ├── ChangeLinr-0.2.0.js
│   ├── DeviceLayr-0.2.0.js
│   ├── EightBittr-0.2.0.js
│   ├── FPSAnalyzr-0.2.1.js
│   ├── GamesRunnr-0.2.0.js
│   ├── GameStartr-0.2.0.js
│   ├── GroupHoldr-0.2.1.js
│   ├── InputWritr-0.2.0.js
│   ├── ItemsHoldr-0.2.1.js
│   ├── LevelEditr-0.2.0.js
│   ├── MapScreenr-0.2.1.js
│   ├── MapsCreatr-0.2.1.js
│   ├── MapsHandlr-0.2.0.js
│   ├── MathDecidr-0.2.0.js
│   ├── ModAttachr-0.2.2.js ⭐ (Feature flag system)
│   ├── NumberMakr-0.2.2.js
│   ├── ObjectMakr-0.2.2.js
│   ├── PixelDrawr-0.2.0.js
│   ├── PixelRendr-0.2.0.js
│   ├── QuadsKeepr-0.2.1.js
│   ├── ScenePlayr-0.2.0.js
│   ├── StringFilr-0.2.1.js
│   ├── ThingHittr-0.2.0.js
│   ├── TimeHandlr-0.2.0.js
│   ├── TouchPassr-0.2.0.js
│   ├── UserWrappr-0.2.0.js
│   ├── WorldSeedr-0.2.0.js
│   └── js_beautify.js
└── settings/
    ├── audio.js (50 lines)
    ├── collisions.js (21 lines)
    ├── devices.js
    ├── editor.js (337 lines)
    ├── events.js
    ├── generator.js (149,753 lines)
    ├── groups.js (5 lines)
    ├── input.js (42 lines)
    ├── maps.js (243,764 lines)
    ├── math.js
    ├── mods.js (735 lines) ⭐ (Feature definitions)
    ├── objects.js (34,703 lines)
    ├── quadrants.js
    ├── renderer.js
    ├── runner.js (33 lines)
    ├── scenes.js
    ├── sprites.js (115,972 lines)
    ├── statistics.js
    ├── touch.js
    └── ui.js (402 lines) ⭐ (UI options)
```

---

## DEVELOPMENT WORKFLOW

### Making Changes

**For JavaScript-only changes (settings/):**
1. Edit file in `Source/settings/`
2. Refresh browser
3. Changes apply immediately

**For TypeScript changes (FullScreenMario.ts):**
1. Edit `Source/FullScreenMario.ts`
2. Run `npx grunt` (compiles to FullScreenMario.js)
3. Refresh browser
4. Changes apply

### Testing Changes

**Running the game:**
```bash
python3 -m http.server 8080 --directory Source
```
Open: http://localhost:8080

**Browser Console:**
```javascript
// Access game instance
var FSM = window.FSM;

// Enable/disable mods
FSM.ModAttacher.enableMod("ModName");
FSM.ModAttacher.disableMod("ModName");

// Get mod info
FSM.ModAttacher.getMod("ModName");

// Check enabled mods
FSM.ModAttacher.getEnabledMods();

// Modify properties live
FSM.gravity = 0.2;
FSM.player.power = 3;  // Big + Fire Mario
```

### Debugging Tips

**Common Variables:**
- `window.FSM` - Game instance
- `FSM.player` - Player Thing
- `FSM.GroupHolder` - All Things
- `FSM.ModAttacher` - Mod system
- `FSM.ItemsHolder` - Persistent storage

**Useful Functions:**
- `FSM.addThing("Type", x, y)` - Spawn Thing
- `FSM.killPlayer(player)` - Kill player
- `FSM.setMap("1-1", 0)` - Load level
- `FSM.pause()` / `FSM.play()` - Pause/unpause

---

## QUICK START CHECKLIST

### To Add a New Feature Flag:

1. ✅ Open `Source/settings/mods.js`
2. ✅ Copy mod template from this guide
3. ✅ Fill in name, description, author
4. ✅ Write `onModEnable` function (feature on)
5. ✅ Write `onModDisable` function (feature off)
6. ✅ Add event hooks if needed
7. ✅ Save file (no compilation needed!)
8. ✅ Refresh browser
9. ✅ Check Options > Mods menu in game

### To Remove a Feature:

1. ✅ Open `Source/settings/mods.js`
2. ✅ Find mod by name
3. ✅ Delete entire mod object
4. ✅ Save file
5. ✅ Refresh browser

### To Toggle Existing Feature:

**In game UI:**
- Options > Mods > Check/uncheck mod

**In code:**
```javascript
FSM.ModAttacher.enableMod("ModName");
FSM.ModAttacher.disableMod("ModName");
```

**Set default state:**
```javascript
// In mods.js
"enabled": true  // or false
```

---

## COMMON USE CASES

### Disable Enemies
```javascript
"onAddThing": function(mod, thing) {
    if (thing.groupType === "enemy") {
        FSM.killNormal(thing);
    }
}
```

### Invincibility
```javascript
"onModEnable": function(mod) {
    mod.settings.originalKill = mod.game.killPlayer;
    mod.game.killPlayer = function() {};
},
"onModDisable": function(mod) {
    mod.game.killPlayer = mod.settings.originalKill;
}
```

### Speed Boost
```javascript
"onModEnable": function(mod) {
    var player = mod.game.player;
    player.maxspeedsave = player.maxspeed;
    player.maxspeed = player.maxspeed * 2;
},
"onModDisable": function(mod) {
    var player = mod.game.player;
    player.maxspeed = player.maxspeedsave;
}
```

### Infinite Jump
```javascript
"onKeyDownUp": function(mod) {
    var player = mod.game.player;
    player.yvel = mod.game.unitsize * -6;
}
```

### Auto-Scroll Disable
```javascript
"onModEnable": function(mod) {
    mod.game.MapScreener.canscroll = false;
},
"onModDisable": function(mod) {
    mod.game.MapScreener.canscroll = true;
}
```

---

## SUMMARY

**This codebase has:**
- ✅ Built-in feature flag system (ModAttachr)
- ✅ 26+ event hooks for customization
- ✅ LocalStorage persistence
- ✅ UI integration for toggles
- ✅ 16 example mods showing patterns
- ✅ No compilation needed for mods
- ✅ Full source code access

**Best practices:**
- Use existing mod system for feature flags
- No need to modify core files for most features
- JavaScript changes = instant (no build)
- TypeScript changes = requires `npx grunt`
- Test in browser console first
- Store state in `mod.settings`

**Project location:**
`/Users/tobydrinkall/dev-mario/`

**Game URL:**
http://localhost:8080 (when server running)

---

END OF OVERVIEW
