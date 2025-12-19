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

    // Listen for dashboard commands via localStorage
    window.addEventListener('storage', function(e) {
        console.log('Storage event detected:', e.key, e.newValue ? 'has value' : 'no value');

        if (e.key === 'FSM::dashboard::command' && e.newValue) {
            try {
                var command = JSON.parse(e.newValue);
                console.log('Parsed command:', command);

                if (command.action === 'toggleMod') {
                    if (window.FSM && window.FSM.ModAttacher) {
                        console.log('✓ Executing:', command.modName, command.enabled ? 'ENABLE' : 'DISABLE');
                        if (command.enabled) {
                            window.FSM.ModAttacher.enableMod(command.modName);
                        } else {
                            window.FSM.ModAttacher.disableMod(command.modName);
                        }
                        // Send response back to dashboard
                        localStorage.setItem('FSM::dashboard::response', JSON.stringify({
                            success: true,
                            modName: command.modName,
                            enabled: command.enabled,
                            timestamp: Date.now()
                        }));
                        console.log('✓ Mod toggled successfully');
                    } else {
                        console.error('✗ FSM or ModAttacher not available');
                    }
                }
            } catch (err) {
                console.error('✗ Error processing dashboard command:', err);
            }
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('FSM::game::running', 'false');
    });
};
