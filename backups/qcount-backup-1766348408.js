// Backup of QCount feature flag from Source/settings/mods.js
// Lines 480-553
// Created: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

{
    "name": "QCount",
    "description": "QQQQQQQ",
    "author": {
        "name": "Josh Goldberg",
        "email": "josh@fullscreenmario.com"
    },
    "enabled": false,
    "events": {
        "onModEnable": function (mod) {
            var FSM = FullScreenMario.FullScreenMario.prototype.ensureCorrectCaller(this),
                characters = mod.settings.characters,
                charactersFSM = FSM.GroupHolder.getCharacterGroup(),
                level;
            
            FSM.InputWriter.addEvent("onkeydown", "q", function () {
                mod.settings.qcount += 1;
                
                if (mod.settings.levels[mod.settings.qcount]) {
                    var level = mod.settings.levels[mod.settings.qcount];
                    mod.settings.events.push(FSM.TimeHandler.addEventInterval(function () {
                        if (charactersFSM.length < 210) {
                            var num = Math.floor(Math.random() * level.length),
                                lul = FSM.ObjectMaker.make.apply(FSM.ObjectMaker, level[num]);
                            
                            lul.yvel = Math.random() * FSM.unitsize / 4;
                            lul.xvel = lul.speed = Math.random() * FSM.unitsize * 2;
                            if (Math.floor(Math.random() * 2)) {
                                lul.xvel *= -1;
                            }
                            
                            characters.push(lul);
                            FSM.addThing(
                                lul, 
                                (32 * Math.random() + 128) * FSM.unitsize,
                                88 * Math.random() * FSM.unitsize
                            );
                        }
                    }, 7, Infinity));
                }
            });
            FSM.InputWriter.addAliasValues("q", [81]);
        },
        "onModDisable": function (mod) {
            mod.settings.qcount = 0;
            mod.settings.events.forEach(this.TimeHandler.cancelEvent);
            mod.settings.events.length = 0;
            this.InputWriter.removeEvent("onkeydown", 81, undefined);
            this.InputWriter.removeEvent("onkeydown", "q", undefined);
        },
        "onSetLocation": function (mod) {
            mod.settings.qcount = 0;
        }
    },
    "settings": {
        "qcount": 0,
        "characters": [],
        "events": [],
        "levels": {
            "7": [ ["Goomba"] ],
            "14": [ 
                ["Koopa"],
                ["Koopa", { "smart": true }],
                ["Koopa", { "jumping": true }],
                ["Koopa", { "smart": true, "jumping": true }],
                ["Beetle"],
                ["HammerBro"],
                ["Lakitu"],
                ["Blooper"]
            ],
            "21": [ ["Bowser"] ]
        }
    }
}
