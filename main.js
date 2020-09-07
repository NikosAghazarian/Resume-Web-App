const express = require('express');
let app = express();


// ROUTING
const viewRouter = require('./UI/routes/ViewRouter.js');


// Asset Setup
app.use('/Assets/background.jpg', express.static('Assets/background.jpg'));
app.use('/Assets/portrait_cropped.jpg', express.static('Assets/portrait_cropped.jpg'));
app.use('/Assets/Waveform_App.PNG', express.static('Assets/Waveform_App.PNG'));
app.use('/Assets/Connect_4.PNG', express.static('Assets/Connect_4.PNG'));
app.use('/Assets/InternetMonitor.PNG', express.static('Assets/InternetMonitor.PNG'));
app.use('/Assets/Sql.PNG', express.static('Assets/Sql.PNG'));

//Static file setup
app.use(express.static(__dirname + '/UI/'));
app.use('/', viewRouter.index);


// hosting http server
let port = process.env.PORT;
app.listen(port, console.log('NodeJS/Express server started on: ' + port));
