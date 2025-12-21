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

    // FEATURE FLAG: PERFORMANCE_HUD - Start
    // Initialize Performance HUD tracking
    if (typeof window.PerformanceHUD !== 'undefined') {
        window.PerformanceHUD.initialize();
        console.log('✓ Performance HUD initialized');
    }
    // FEATURE FLAG: PERFORMANCE_HUD - End

    // Wait a moment for FSM to be fully initialized, then mark as running
    setTimeout(function() {
        if (window.FSM && window.FSM.ModAttacher) {
            localStorage.setItem('FSM::game::running', 'true');
            console.log('✓ Game marked as running. FSM.ModAttacher available.');

            // DEBUG: Verify jump physics constant loaded correctly
            if (window.FSM.MapScreener) {
                console.log('🎮 MapScreener.jumpmod_v2 =', window.FSM.MapScreener.jumpmod_v2, '(should be 2.112)');
            }

            // FEATURE FLAG: PERFORMANCE_HUD - Start
            // Start HUD updates when game is ready
            if (typeof window.PerformanceHUD !== 'undefined') {
                window.PerformanceHUD.startUpdates();
            }
            // FEATURE FLAG: PERFORMANCE_HUD - End
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
