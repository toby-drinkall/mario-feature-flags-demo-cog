/// <reference path="../FullScreenMario.ts" />

FullScreenMario.FullScreenMario.settings.math = {
    "equations": {
        /**
         * Decreases a player's jumping yvel based on whether it's running.
         */
        "decreasePlayerJumpingYvel": function (
            constants: FullScreenMario.IMapScreenr,
            equations: MathDecidr.IEquationContainer,
            player: FullScreenMario.IPlayer): void {

            // FEATURE FLAG: useEnhancedJumpPhysics
            var jumpmod: number;
            if (player.FSM.settings.features && player.FSM.settings.features.useEnhancedJumpPhysics) {
                // NEW: Enhanced physics with momentum-based calculations
                jumpmod = player.FSM.MapScreener.jumpmod * 1.2;
                var momentum: number = player.xvel * 0.0018;
                jumpmod = jumpmod - momentum;
            } else {
                // OLD: Original simple physics (will be removed when flag is deleted)
                jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
            }

            var power: number = Math.pow(player.keys.jumplev, jumpmod),
                dy: number = player.FSM.unitsize / power;

            player.yvel = Math.max(player.yvel - dy, constants.maxyvelinv);
        },
        /**
         * Decreases a player's running xvel based on whether it's sprinting.
         * @returns {Boolean} True if the player started or stopped skidding,
         *                    or false if the skidding status was unchanged.
         */
        "decreasePlayerRunningXvel": function (
            constants: FullScreenMario.IMapScreenr,
            equations: MathDecidr.IEquationContainer,
            player: FullScreenMario.IPlayer): boolean {
            // If a button is pressed, hold/increase speed
            if (player.keys.run !== 0 && !player.crouching) {
                var dir: number = player.keys.run,
                    // No sprinting underwater
                    sprinting: number = Number(player.keys.sprint && !player.FSM.MapScreener.underwater) || 0,
                    adder: number,
                    decel: number = 0,
                    skiddingChanged: boolean = false;

                // FEATURE FLAG: useFastRunning
                if (player.FSM.settings.features && player.FSM.settings.features.useFastRunning) {
                    // NEW: 25% faster acceleration
                    adder = dir * (.1225 * (Number(sprinting) + 1));
                } else {
                    // OLD: Original speed (will be removed when flag is deleted)
                    adder = dir * (.098 * (Number(sprinting) + 1));
                }

                // Reduce the speed, both by subtracting and dividing a little
                player.xvel += adder || 0;
                player.xvel *= .98;
                decel = .0007;

                // If you're accelerating in the opposite direction from your current velocity, that's a skid
                if ((player.keys.run > 0) === player.moveleft) {
                    if (!player.skidding) {
                        player.skidding = true;
                        skiddingChanged = true;
                    }
                } else if (player.skidding) {
                    // Not accelerating: make sure you're not skidding
                    player.skidding = false;
                    skiddingChanged = true;
                }
            } else {
                // Otherwise slow down a bit
                player.xvel *= .98;
                decel = .035;
            }

            if (player.xvel > decel) {
                player.xvel -= decel;
            } else if (player.xvel < -decel) {
                player.xvel += decel;
            } else if (player.xvel !== 0) {
                player.xvel = 0;
                if (!player.FSM.MapScreener.nokeys && player.keys.run === 0) {
                    if (player.keys.leftDown) {
                        player.keys.run = -1;
                    } else if (player.keys.rightDown) {
                        player.keys.run = 1;
                    }
                }
            }

            return skiddingChanged;
        },
        /**
         * @return A player's yvel for when it's riding up a springboard.
         */
        "springboardYvelUp": function (
            constants: FullScreenMario.IMapScreenr,
            equations: MathDecidr.IEquationContainer,
            thing: FullScreenMario.ISpringboard): number {
            return Math.max(thing.FSM.unitsize * -2, thing.tensionSave * -.98);
        }
    }
};
