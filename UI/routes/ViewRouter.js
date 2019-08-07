const index = require('express').Router();
const internetMonitor = require('express').Router();
const path = require('path');

const options = {
    root: path.join(__dirname, '..')
}

index.get('/',  (req, res, next) =>{
    res.sendFile('./views/index.html', options);
});

internetMonitor.get('/',  (req, res, next) =>{
    res.sendFile('./views/InternetMonitor.html', options);
});



module.exports = {
    index: index,
    internetMonitor: internetMonitor
};