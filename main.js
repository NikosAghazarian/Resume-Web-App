const express = require('express');
let app = express();


// ROUTING
const viewRouter = require('./UI/routes/ViewRouter.js');


// Asset Setup
app.use('/favicon.ico', express.static('assets/favicon.ico'));
app.use('/Resume', express.static('Assets/Nikos_Aghazarian_Resume.pdf'));
app.use('/Assets/background.jpg', express.static('Assets/background.jpg'));


//Static file setup
app.use(express.static(__dirname + '/UI/'));
app.use('/', viewRouter.index);
app.use('/home', viewRouter.home);


// hosting http server
let port = process.env.PORT || 3000;
app.listen(port, '192.168.221.4');
console.log('NodeJS/Express server started on: ' + port);


