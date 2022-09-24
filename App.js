/*
App.js
Define the application instance here:
- Check for saved application settings
- Take ownership of any persistent Electron classes
*/

const { BrowserWindow, app, ipcMain } = require("electron");
const platform = require('os').platform;
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

const { MainEvents } = require("./IpcProcol.js");

// Common BrowserWindow options for the constructor
const WindowProps = {
    frame: false,
    transparent: true,
    resizable: false,
    moveable: false,
    roundedCorners: false,
    webPreferences: {
        preload: path.join(app.getAppPath(), "NativeApi.js"),
        devTools: true,
    },
    focusable: false,
    type: (platform == "win32") ? "normal" : "desktop"
};

// Default configuration JSON
const DEFAULT_CONFIG = {
    // Directory for storing saved layouts
    LayoutDirectory: path.join(app.getPath("documents"), "/Desktop-Deco/layouts"),
    // Set nodeIntegration for the widget layer to this value
    ExposeNode: false,
    // Directory for storing individual widgets
    WidgetDirectory: path.join(app.getPath("documents"), "/Desktop-Deco/widgets"),
    // Location of the config May change to the appData directory instead, not meant to be altered by the user
    AppState: path.join(app.getPath("appData"), "/prefs.json"),
    // JSON representing the last layout
    LastLayout: {},
    // String representing the path of the last loaded layout
    LastLayoutPath: null
};

/**
 * Widget layer is managed here. Use member functions as event handlers.
 */
class ApplicationInstance {
    constructor() {
        this.interactable = false;
        this.window = new BrowserWindow(WindowProps);
        // Flag to allow async file reads for intial set up
        this.starting = true;
        // Start loading widgets from loaded layout
        if (fs.existsSync(DEFAULT_CONFIG.AppState)) {
            fsPromises.readFile(DEFAULT_CONFIG.AppState, {encoding: "utf8"}).then( data => {
                this.AppConfig = JSON.parse(data);
                this.starting = false;
                if (this.AppConfig.LastLayoutpath) this.SetLayout(this.AppConfig.LastLayoutPath);
            }).catch(error => {
                console.log(error);
                // Maybe make it emit an error event here and listen for it on main.js
            });
        } else {
            this.AppConfig = structuredClone(DEFAULT_CONFIG);
            this.starting = false;
            
        }
    }
    /**
     * Controls whether the widget plane will recieve mouse and keyboard events.
     * @param {boolean} event - Event object passed by an event emitter
     */
    ToggleEditing(event) {
        this.interactable = !this.interactable;
        this.window.setEnabled(this.interactable);
        this.window.setFocusable(this.interactable);
        if (this.interactable) ipcMain.send(MainEvents.EnableWidgets);
        else ipcMain.send(MainEvents.DisableWidgets);
    }
    /**
     * Adds a widget to the main plane on the specified x or y coordinates.
     * @param {string} widgetPath File path to the widget.
     * @param {number} xpos X-coordinate to render the given widget.
     * @param {number} ypos Y-coordinate to render the given widget. 
     */
    AddWidget(widgetPath, xpos, ypos) {
        // This function may receive user-created input, error-handle here
        let ipcArg = {
            path: widgetPath,
            x: (xpos) ? x : 0,
            y: (ypos) ? y : 0
        }
        if (fs.existsSync(widgetPath)) {
            ipcMain.send(MainEvents.AddWidget, ipcArg);
        } else {
            return;
        }
        this.AppConfig.LastLayout[widgetPath] = {x: ipcArg.x, y: ipcArg.y};
    }
    /**
     * Sets the layout on the widget layer. Silently fails if given an invalid filepath and throws if the file is not valid JSON. This should behave atomically if it encounters errors.
     * @param {object|fs.pathLike} layout Either a JSON describing the layout of widgets or a path to a layout file. If argument is a JSON, use widget paths as the key and have each key contain an object with x and y coordinates as properties.
     */
    SetLayout(layout) {
        // This function may receive user-created input, error-handle here
        let prevLayout = this.AppConfig.LastLayout;
        let prevPath = this.AppConfig.LastLayoutPath;
        // Check if argument is string
        if (layout.toUpperCase && fs.existsSync(layout)) {
            let file = fs.readFileSync(layout, {encoding:"utf8"});
            try {
                this.AppConfig.LastLayout = JSON.parse(file);
                this.AppConfig.LastLayoutPath = layout;
            } catch (error) {
                return;
            }
            
        } else {
            this.AppConfig.LastLayout = layout;
            this.AppConfig.LastLayoutPath = null;
        }

        ipcMain.send(MainEvents.ClearLayout);

        for (let widget in Object.keys(layout)) {
            try{
                this.AddWidget(widget, layout[widget].x, layout[widget].y);
            } catch (error) {
                this.AppConfig.lastLayout = prevLayout;
                this.AppConfig.LastLayoutPath = prevPath;
                this.SetLayout(prevLayout);
                return;
            }
        }
    }
    /**
     * Check if the application has completed all initial IO operations.
     * @returns Returns true if not waiting on IO to complete.
     */
    IsReady() {
        return !this.starting;
    }
    /**
     * Saves the current settings to disk.
     */
    SaveSettings() {
        let settings = JSON.stringify(this.AppConfig);
        fs.writeFileSync(this.Appconfig.AppState, settings, { encoding: "utf8"});
    }
    /**
     * Perform clean up actions and save the current layout and settings.
     */
    Quit() {
        this.SaveSettings();
        this.window.destroy();
    }
    /**
     * Getter for application settings.
     * @returns Refer to {@link DEFAULT_CONFIG} for the object schema.
     */
    GetSettings() {
        return this.AppConfig;
    }
}

exports.DecoApplication = ApplicationInstance;