let timeWidget = document.querySelector('#time'), dateWidget = document.querySelector('#date');

function TimeString(dateObj) {
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    let seconds = dateObj.getSeconds();
    if (minutes < 10) minutes = `0${minutes}`;
    if (seconds < 10) seconds = `0${seconds}`;
    return `${hours}:${minutes}:${seconds}`;
}

function DateString(dateObj) {
    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${MONTHS[dateObj.getMonth()]} ${dateObj.getDate()}`
}

function updateDateWidget() {
    let currentDateTime = new Date(Date.now());
    timeWidget.innerHTML = TimeString(currentDateTime);
    dateWidget.innerHTML = DateString(currentDateTime);
}

let updateID = setInterval(updateDateWidget, 1000);