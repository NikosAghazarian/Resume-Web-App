const index = require('express').Router();
const home = require('express').Router();

const path = require('path');


const options = {
    root: path.join(__dirname, '..')
}

index.get('/', (req, res, next) => {
    res.sendFile('./views/index.html', options);
});


module.exports = {
    index: index
};