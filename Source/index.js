var time = Date.now();

document.onreadystatechange = function (event) {
    if (event.target.readyState !== "complete") {
        return;
    }

    var UserWrapper = new UserWrappr.UserWrappr(FullScreenMario.FullScreenMario.prototype.proliferate(
        {
            "GameStartrConstructor": FullScreenMario.FullScreenMario
        }, FullScreenMario.FullScreenMario.settings.ui, true));

    console.log("It took " + (Date.now() - time) + " milliseconds to start."), UserWrapper.displayHelpMenu();

    // FEATURE FLAG: PERFORMANCE_HUD - Disabled to avoid overlap with debug info

    // Wait a moment for FSM to be fully initialized, then mark as running
    setTimeout(function() {
        if (window.FSM && window.FSM.ModAttacher) {
            localStorage.setItem('FSM::game::running', 'true');
            console.log('✓ Game marked as running. FSM.ModAttacher available.');

            // DEBUG: Verify jump physics constant loaded correctly (dynamic detection)
            var debugDiv = null;
            if (window.FSM.MapScreener) {
                // Dynamically detect which feature flag is active
                var activeFlag = null;
                var expectedValue = null;

                if (window.FSM.MapScreener.jumpmod_v2 !== undefined) {
                    activeFlag = 'jumpmod_v2';
                    expectedValue = 0.528;
                }

                if (activeFlag) {
                    var actualValue = window.FSM.MapScreener[activeFlag];
                    var isCorrect = expectedValue ? actualValue === expectedValue : null;

                    console.log('🎮 MapScreener.' + activeFlag + ' =', actualValue,
                                expectedValue ? '(expected: ' + expectedValue + ')' : '');

                    // Create visual indicator in game window
                    debugDiv = document.createElement('div');
                    debugDiv.id = 'jump-physics-debug';
                    debugDiv.style.cssText = 'position:fixed;top:80px;right:10px;background:rgba(0,0,0,0.9);color:#0f0;padding:15px;font-family:monospace;font-size:14px;z-index:99999;border:2px solid #0f0;border-radius:8px;';
                    debugDiv.innerHTML = '<strong>Jump Physics Debug</strong><br>' +
                        activeFlag + ': ' + (actualValue || 'UNDEFINED') + '<br>' +
                        (expectedValue ? 'Expected: ' + expectedValue + '<br>' : '') +
                        (isCorrect !== null ? 'Status: ' + (isCorrect ? '✓ CORRECT' : '✗ WRONG') : 'Status: Active');
                    document.body.appendChild(debugDiv);
                } else {
                    console.warn('⚠️ No jump physics constant found (jumpmod_v2)');
                }
            }

                // Auto-remove after 10 seconds
                if (debugDiv) {
                    setTimeout(function() {
                        if (debugDiv && debugDiv.parentNode) {
                        debugDiv.parentNode.removeChild(debugDiv);
                    }
                }, 10000);
            }

            // FEATURE FLAG: PERFORMANCE_HUD - Disabled
        } else {
            console.error('✗ FSM not available after initialization');
        }
    }, 500);

    // Mark game as running (no longer need storage event listeners since dashboard directly reloads the window)

    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('FSM::game::running', 'false');
    });
};
