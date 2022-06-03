'use-strict'

let frame = document.querySelector('body');

function populateGrid(columns, rows, frameElement) {
    console.log('populateGrid called');
    for (let idx = 0; idx < rows; idx++) {
        let rowContainer = document.createElement('div');
        rowContainer.className = 'row-container';
        for (let columnCount = 0; columnCount < columns; columnCount++) {
            let cell = document.createElement('div');
            cell.className = "grid-cell";
            rowContainer.appendChild(cell);
        }
        frameElement.appendChild(rowContainer);
    }
}

populateGrid(3, 5, frame);