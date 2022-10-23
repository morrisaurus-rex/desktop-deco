/*
App.js
Define the application instance here:
- Check for saved application settings
- Take ownership of any persistent Electron classes
*/

const { BrowserWindow, app, ipcMain, Tray } = require("electron");
const platform = require('os').platform;
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
// Native module for windows, mainly to make the widget layer ignore the normal "show desktop" behaviour
const win32 = (platform() == "win32") ? require('./build/Release/win32.node'): null;

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
    // Location of the config, may change to the appData directory instead, not meant to be altered by the user
    AppState: path.join(app.getPath("appData"), "/prefs.json"),
    // JSON representing the last layout
    LastLayout: {},
    // String representing the path of the last loaded layout
    LastLayoutPath: null
};

/**
 * Creates the application's tray menu.
 * @param {ApplicationInstance} application An instance of the application.
 * @returns The Electron {@link Tray} object.
 */
 function CreateTrayMenu(application) {
    let tray  = new Tray('./assets/appicon.png');
    const cxtMenu = Menu.buildFromTemplate([
        {
            label: 'Quit',
            role: 'quit'
        },
        {
            label: 'Settings',
            click: function (menuitem, browserWindow, event) {
                if (browserWindow == application.SettingsWindow) return;
                application.SettingsWindow.show();
            }
        },
        {
            label: 'Open Developer Tools',
            click: function (menuitem, browserWindow, event) {
                console.log('Widget Dev Tools clicked');
                if (application.AppWindow.webContents.isDevToolsOpened()) {
                    application.SettingsWindow.webContents.closeDevTools();
                    application.AppWindow.webContents.closeDevTools();
                } else {
                    application.SettingsWindow.webContents.openDevTools();
                    application.AppWindow.webContents.openDevTools();
                }
            }
        }
    ]);
    tray.setContextMenu(cxtMenu);
    tray.setToolTip('Desktop Deco');
    return tray;
}

/**
 * Application manager.
 */
class ApplicationInstance {
    /**
     * Initialize an application instance. Supply the working directory with process.cwd().
     * @param {fs.pathLike} workingDir Working directory of the application.
     * @param {boolean} isTesting Set to true to enable testing and disable any filesystem writes
     */
    constructor(workingDir, isTesting) {
        if (isTesting) this.Test = true;
        else this.Test = false;

        this.SettingsWindow = new BrowserWindow({
            width: 500,
            height: 700,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            devTools: true,
            center: true
        });
        this.WorkingDir = workingDir;
        this.TrayIcon = CreateTrayMenu(this);
        this.Interactable = false;
        this.AppWindow = new BrowserWindow(WindowProps);
        if (platform() == "win32") win32.ignoreShowDesktop(this.AppWindow.getNativeWindowHandle());

        if (!isTesting) {
            this.AppWindow.loadFile(path.join(this.WorkingDir, "ui/WidgetPlane.html"));
            this.SettingsWindow.loadFile(path.join(this.WorkingDir, "ui/SettingsWindow.html"));
        }
        // Flag to allow async file reads for intial set up
        this.Starting = true;
        // Start loading widgets from loaded layout
        if (!isTesting && fs.existsSync(DEFAULT_CONFIG.AppState)) {
            fsPromises.readFile(DEFAULT_CONFIG.AppState, {encoding: "utf8"}).then( data => {
                this.AppConfig = JSON.parse(data);
                this.starting = false;
                if (this.AppConfig.LastLayoutPath) this.SetLayout(this.AppConfig.LastLayoutPath);
            }).catch(error => {
                console.log(error);
                // Maybe make it emit an error event here and listen for it on main.js
            });
        } else {
            this.AppConfig = structuredClone(DEFAULT_CONFIG);
            this.Starting = false;
        }

        for (let event of Object.keys(MainHandlers)) {
            ipcMain.on(MainHandlers[event].Message, MainHandlers[event].Handler.bind(this));
        }
        this.AppWindow.show();
    }
    /**
     * Handles the toggle edit IPC.
     * @param {Event} event - Event object passed by an event emitter. If present, will not make an IPC call.
     * @param {boolean} bool - _(Optional)_ If true then enable interactability, else lock the widget layer.
     */
    ToggleEditingHandler(event, bool) {
        if (arguments.length > 1) this.interactable = !bool;
        this.interactable = !this.interactable;
        this.AppWindow.setEnabled(this.interactable);
        this.AppWindow.setFocusable(this.interactable);
  
    }
    /**
     * Controls whether the widget layer will receive mouse events.
     * @param {Boolean} bool True to enable widget layer, false to disable. No parameters will toggle the state.
     */
    ToggleEditing(bool) {
        if (arguments.length > 0) {
            this.ToggleEditingHandler(null, bool);
        }
        else this.ToggleEditingHandler(null);
        if (this.AppWindow.isEnabled()) ipcMain.send(MainEvents.EnableWidgets);
        else ipcMain.send(MainEvents.DisableWidgets);
    }
    /**
     * Used as a handler for {@link MainEvents.AddWidget} events.
     * @param {Event} event If present, function will not send an IPC message.
     * @param {fs.pathLike} widgetPath File path to the widget.
     * @param {Number} xpos _(Optional)_ X-coordinate to render the given widget.
     * @param {Number} ypos _(Optional)_ Y-coordinate to render the given widget.
     * @param {Number} width _(Optional)_ Width for the enclosing HTML element. Can be set to null.
     * @param {Number} height _(Optional)_ Height for the enclosing HTML element. Can be set to null.
     */
    AddWidgetHandler(event, widgetPath, xpos, ypos, width, height) {
        // This function may receive user-created input, error-handle here
        if (!fs.existsSync(widgetPath)) throw new Error("Widget file does not exist");
        this.AppConfig.LastLayout[widgetPath] = {
            x: (xpos) ? xpos : 0,
            y: (ypos) ? ypos : 0,
            w: (width) ? width : null,
            h: (height) ? height : null
        };
    }
    
    /**
     * Adds a widget to the widget layer.
     * @param {fs.pathLike} widgetPath File path to widget.
     * @param {Number} xpos _(Optional)_ X-coordinate to render the given widget.
     * @param {Number} ypos _(Optional)_ Y-coordinate to render the given widget.
     * @param {Number} width _(Optional)_ Width for the enclosing HTML element. Can be set to null.
     * @param {Number} height _(Optional)_ Height for the enclosing HTML element. Can be set to null.
     */
    AddWidget(widgetPath, xpos, ypos, width, height) {
        try {
            this.AddWidgetHandler(null, widgetPath, xpos, ypos, width, height);
            ipcMain.send(MainEvents.AddWidget, widgetPath, layoutRef.x, layoutRef.y, layoutRef.width, layoutRef.height);
        } catch (e) {
            console.log('Widget file does not exist');
        }
    }
    /**
     * Handler for moving the widget.
     * @param {Event} event If present, the function assumes it is handling an IPC event and does not send out an IPC message itself.
     * @param {fs.pathLike} widgetPath File path of the widget.
     * @param {Number} xpos X-position of the widget.
     * @param {Number} ypos Y-position of the widget.
     */
    MoveWidgetHandler(event, widgetPath, xpos, ypos) {
        if (!fs.existsSync(widgetPath)) return;
        this.AppConfig.LastLayout[widgetPath].x = xpos;
        this.AppConfig.LastLayout[widgetPath].y = ypos;
    }
    /**
     * Moves a widget to the specified coordinates.
     * @param {fs.pathLike} widgetPath File path of the widget.
     * @param {Number} xpos X-position of the widget.
     * @param {Number} ypos Y-position of the widget.
     */
    MoveWidget(widgetPath, xpos, ypos) {
        this.MoveWidgetHandler(null, widgetPath, xpos, ypos);
        ipcMain.send(MainEvents.MoveWidget, widgetPath, xpos, ypos);
    }
    /**
     * Handles IPC requests to resize widgets
     * @param {Event} event 
     * @param {fs.pathLike} widgetPath Filepath to the widget.
     * @param {Number} width Requested width.
     * @param {Number} height Requested height.
     */
    ResizeWidgetHandler(event, widgetPath, width, height) {
        if (!fs.existsSync(widgetPath)) throw new Error("Widget file does not exist");
        this.AppConfig.LastLayout[widgetPath].w = width;
        this.AppConfig.LastLayout[widgetPath].h = height;
    }
    /**
     * Resizes the specified widget.
     * @param {fs.pathLike} widgetPath Filepath to the widget.
     * @param {Number} width Requested width.
     * @param {Number} height Requested height.
     */
    ResizeWidget(widgetPath, width, height) {
        this.ResizeWidgetHandler(null, widgetPath, width, height);
        ipcMain.send(MainEvents.ResizeWidget, widgetPath, width, height);
    }
    /**
     * Handles IPC requests to set the layout of the widget layer.
     * @param {object|fs.pathLike} layout Either a JSON describing the layout of widgets or a path to a layout file. If argument is a JSON, use widget paths as the key and have each key contain an object with x and y coordinates as properties.
     */
    SetLayout(layout) {
        // This function may receive user-created input, error-handle here
        let prevLayout = this.AppConfig.LastLayout;
        let prevPath = this.AppConfig.LastLayoutPath;
        if (fs.existsSync(layout)) {
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
            return;
        }
        ipcMain.send(MainEvents.ClearLayout);

        for (let widget in Object.keys(layout)) {
            try{
                this.AddWidget( widget, layout[widget].x, layout[widget].y, layout[widget].w, layout[widget].h);
            } catch (error) {
                this.AppConfig.LastLayout = prevLayout;
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
        if (this.Test) {
            console.log('Settings Saved.');
            return;
        }
        let settings = JSON.stringify(this.AppConfig);
        fs.writeFileSync(this.Appconfig.AppState, settings, { encoding: "utf8"});
    }
    /**
     * Change the visibility state of the applications settings window.
     * @param {boolean} bool _(Optional)_ If true, then window will be shown. If no argument is provided then the setting window's visibility state will be toggled.
     */
    ShowSettings(bool) {
        if (arguments.length > 0) {
            (bool)? this.SettingsWindow.show() : this.SettingsWindow.hide();
        }
        else {
            (this.SettingsWindow.isVisible()) ? this.SettingsWindow.hide() : this.SettingsWindow.show();
        }
    }
    /**
     * Opens or closes the Chrome Developer Tools on the widget window.
     * @param {bool} bool _(Optional)_ If true, then Developer Tools will be opened. If no argument is given then Developer Tools will be toggled.
     */
    ShowDevConsole(event, bool) {
        if (arguments.length > 0) {
            (bool)? this.AppWindow.webContents.openDevTools() : this.AppWindow.webContents.closeDevTools();
        } else {
            let toolStatus = this.AppWindow.webContents.isDevToolsOpened();
            (toolStatus)? this.AppWindow.webContents.closeDevTools() : this.AppWindow.webContents.openDevTools();
        }
    }
    /**
     * Perform clean up actions and save the current layout and settings.
     */
    Quit(event) {
        this.SaveSettings();
        this.window.destroy();
        app.quit();
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