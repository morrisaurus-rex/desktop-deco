const { app } = require('electron');
const path = require('path');

const DEFAULT_CONFIG = {
    LastLayout: null,
    Directory: path.join(app.getPath('documents'), 'Desktop-Deco'),
    StrictSecurity: true
}

// Construct an application configuration using any given valid properties, returns the default config if no parameters are given
function ConstructAppConfig(props) {
    if (!props || typeof props != "object") return structuredClone(DEFAULT_CONFIG);
    let config = {};

    for (let key of Object.keys(DEFAULT_CONFIG)) {
        if (props.hasOwnProperty(key)) config[key] = props[key];
        else config[key] = DEFAULT_CONFIG[key];
    }
    return config;
}