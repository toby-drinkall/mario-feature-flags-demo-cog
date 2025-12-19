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

    // Mark game as running for dashboard
    localStorage.setItem('FSM::game::running', 'true');

    // Listen for dashboard commands via localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'FSM::dashboard::command' && e.newValue) {
            try {
                var command = JSON.parse(e.newValue);
                if (command.action === 'toggleMod' && window.FSM && window.FSM.ModAttacher) {
                    console.log('Dashboard command received:', command.modName, command.enabled ? 'ENABLE' : 'DISABLE');
                    if (command.enabled) {
                        window.FSM.ModAttacher.enableMod(command.modName);
                    } else {
                        window.FSM.ModAttacher.disableMod(command.modName);
                    }
                    // Send response back to dashboard
                    localStorage.setItem('FSM::dashboard::response', JSON.stringify({
                        success: true,
                        timestamp: Date.now()
                    }));
                }
            } catch (err) {
                console.error('Error processing dashboard command:', err);
            }
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('FSM::game::running', 'false');
    });
};
