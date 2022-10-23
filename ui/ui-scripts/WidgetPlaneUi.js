// Body of the Window element
let PrimaryFrame = document.querySelector('body');

class WidgetFrame {
    /**
     * Create a widget iframe with the given absolute filepath as a src attribute. File path should be provided by the IPC event listener.
     * @param {string} filepath An absolute path to the widget HTML file.
     */
    constructor(filepath, x, y, w, h) {
        if (arguments.length < 1) throw new Error("Need filepath");
        this.iframeElement = document.createElement('iframe');
        if (x) this.iframeElement.style.left = x;
        if (x) this.iframeElement.style.top = y;
        if (w) this.iframeElement.style.width = w;
        if (h) this.iframeElement.style.height = h;
        this.iframeElement.attributes[src] = filepath;
        // Set to true if dragIndicatorMouseDown has been fired
        this.beingMoved = false;
        // Outline of the webview element to inform the user of where it will be placed when doing a click and drag move
        this.indicator = null;
    }

    dragIndicatorMouseDown(event) {
        this.beingMoved = true;
        let boundingBox = this.webviewElement.getBoundingClientRect();
        this.indicator = document.createElement('div');
        this.indicator.className = 'drag-indicator';
        this.indicator.style.width = boundingBox.width + 'px';
        this.indicator.style.height = boundingBox.height + 'px';
        this.indicator.style.top = boundingBox.top;
        this.indicator.style.left = boundingBox.left;
        PrimaryFrame.appendChild(this.indicator);
    }

    dragIndicatorMouseUp(self, event) {
        self.beingMoved = false;
    }

    dragIndicatorMouseMove(self, event) {
        if (beingMoved) {

        } else return;
    }
}

class WidgetManager {
    constructor(parentNode) {
        // use widget filepaths as keys for the enclosing WidgetFrame element
        this.WidgetTable = {};
        window.ElectronIpc.RegisterIpc(this);
    }
    AddWidgetHandler(filepath) {
        if (this.WidgetTable[filepath]) return;
        try {
            let wdgCandidate = new WidgetFrame(filepath);
            this.WidgetTable[filepath] = wdgCandidate;
        } catch (error) {
            return;
        }
    }
    ClearHandler() {
        for (let wdg of Object.keys(this.WidgetTable)) {
            PrimaryFrame.removeChild(this.WidgetTable[wdg].iframeElement);
        }
        this.WidgetTable = {};
    }
    RemoveWidgetHandler(filepath) {
        if (this.WidgetTable[filepath]) {
            PrimaryFrame.removeChild(this.WidgetTable[filepath].iframeElement);
            delete this.WidgetTable[filepath];
        } else return;
    }
    MoveWidgetHandler(filepath, xpos, ypos) {
        if (this.WidgetTable[filepath]) {
            this.WidgetTable[filepath].iframeElement.style.left = xpos;
            this.WidgetTable[filepath].iframeElement.style.top = ypos;
        }
    }
    AddWidget(filepath) {
        this.AddWidgetHandler(filepath);
        window.ElectronIpc.AddWidget(filepath);
    }
    MoveWidget(filepath, xpos, ypos) {
        this.MoveWidgetHandler(filepath, xpos, ypos);
        window.ElectronIpc.MoveWidget(filepath, xpos, ypos);
    }
    Clear() {
        this.ClearHandler();
        window.ElectronIpc.ClearLayout();
    }
}