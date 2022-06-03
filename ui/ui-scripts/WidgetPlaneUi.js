// Body of the Window element
let PrimaryFrame = document.querySelector('body');

class WidgetFrame {
    constructor() {
        this.iframeElement = document.createElement('iframe');
        // Set to true if dragIndicatorMouseDown has been fired
        this.beingMoved = false;
        // Outline of the webview element to inform the user of where it will be placed when doing a click and drag move
        this.indicator = null;
    }

    dragIndicatorMouseDown(self, event) {
        self.beingMoved = true;
        let boundingBox = self.webviewElement.getBoundingClientRect();
        self.indicator = document.createElement('div');
        self.indicator.className = 'drag-indicator';
        self.indicator.style.width = boundingBox.width + 'px';
        self.indicator.style.height = boundingBox.height + 'px';
        self.indicator.style.top = boundingBox.top;
        self.indicator.style.left = boundingBox.left;
        PrimaryFrame.appendChild(self.indicator);
    }

    dragIndicatorMouseUp(self, event) {
        self.beingMoved = false;
    }

    dragIndicatorMouseMove(self, event) {
        if (beingMoved) {

        } else return;
    }
} 