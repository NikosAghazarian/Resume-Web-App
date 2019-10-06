const express = require('express');
let app = express();


// ROUTING
const viewRouter = require('./UI/routes/ViewRouter.js');


// Asset Setup
app.use('/favicon.ico', express.static('/Assets/favicon.ico'));
app.use('/Resume', express.static('/Assets/Nikos_Aghazarian_Resume.pdf'));
app.use('/Assets/background.jpg', express.static('/Assets/background.jpg'));
app.use('/Assets/portrait_cropped.jpg', express.static('/Assets/portrait_cropped.jpg'));

//Static file setup
app.use(express.static(__dirname + '/UI/'));
app.use('/', viewRouter.index);
app.use('/home', viewRouter.home);


// hosting http server
let port = process.env.PORT;
app.listen(port, console.log('NodeJS/Express server started on: ' + port));
