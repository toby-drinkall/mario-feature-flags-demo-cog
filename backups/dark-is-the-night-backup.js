// Backup of "Dark is the Night" feature flag
// Removed from Source/settings/mods.js (lines 36-82)
// Backup created: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
// This backup can be used to restore the feature if needed

{
    "name": "Dark is the Night",
    "description": "The night is darkest before the dawn, but I promise you: the dawn is coming.",
    "author": {
        "name": "Josh Goldberg",
        "email": "josh@fullscreenmario.com"
    },
    "enabled": false,
    "events": {
        "onModEnable": function (mod) {
            var area = this.MapsHandler.getArea();
            
            if (!area) {
                return;
            }
            
            mod.events.onPreSetLocation.call(this, mod);
        },
        "onPreSetLocation": function (mod) {
            var area = this.MapsHandler.getArea();
            
            area.setting += " Castle Alt2";
            area.setBackground(area);
            
            this.PixelDrawer.setBackground(area.background);
            this.GroupHolder.callOnAll(this, this.PixelDrawer.setThingSprite.bind(this.PixelDrawer));
            
            this.ModAttacher.fireEvent(
                "onSetLocation",
                this.MapsHandler.getLocation()
            );
        },
        "onModDisable": function (mod) {
            var area = this.MapsHandler.getArea();
            
            area.setting = area.setting.replace(" Castle Alt2", "");
            area.setBackground(area);
            
            this.PixelDrawer.setBackground(area.background);
            this.GroupHolder.callOnAll(this, this.PixelDrawer.setThingSprite.bind(this.PixelDrawer));
            
            this.ModAttacher.fireEvent(
                "onSetLocation",
                this.MapsHandler.getLocation()
            );
        }
    }
}
