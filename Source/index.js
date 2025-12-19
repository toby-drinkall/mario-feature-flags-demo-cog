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

    // Wait a moment for FSM to be fully initialized, then mark as running
    setTimeout(function() {
        if (window.FSM && window.FSM.ModAttacher) {
            localStorage.setItem('FSM::game::running', 'true');
            console.log('✓ Game marked as running. FSM.ModAttacher available.');
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
