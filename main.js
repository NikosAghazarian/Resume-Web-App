const PingMonitor = require('./Server/ping').PingMonitor;
const express = require('express');


// formatted date return method
Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSS', { 
    
    value: function() {
        function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }
        dt = new Date();
        return dt.getFullYear() + '-' +
               pad2(dt.getMonth() + 1) + '-' +
               pad2(dt.getDate()) + ' ' +
               pad2(dt.getHours()) + ':' +
               pad2(dt.getMinutes()) + ':' +
               pad2(dt.getSeconds());
    }
}); 


// ROUTING
const apiRouter = require('./Api/routes/InternetMonitorRoutes');
const viewRouter = require('./UI/routes/ViewRouter.js');

let app = express();
app.use(express.static(__dirname + '/UI/'));
/* app.use(express.static(__dirname + '/UI/stylesheets/css/'));
app.use(express.static(__dirname + '/UI/javascripts/')); */
app.use('/', viewRouter.index);
app.use('/internetMonitor', viewRouter.internetMonitor);

// api initialization
app.use('/api/connection', apiRouter.connection_data_router);
app.use('/api/services', apiRouter.service_data_router);

// hosting http server
let port = process.env.PORT || 3000;
app.listen(port, '192.168.217.128');
console.log('RESTful API started on: ' + port);


// monitor initialization and logging
PingMonitor();

