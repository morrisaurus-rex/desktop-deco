let dateWidget = document.querySelector('#date-widget');

function updateDate() {
    let currentTime = new Date(Date.now());
    dateWidget.innerHTML = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`;
}

let id = setInterval(updateDate, 1000);