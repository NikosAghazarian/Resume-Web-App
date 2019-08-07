const connection_data_router = require('express').Router();
const service_data_router = require('express').Router();


let InternetMonitor = require('../controllers/InternetMonitorController');

connection_data_router.get('/', InternetMonitor.connection_data); // /api/connection?internetConnectionType=[wired|wifi]
service_data_router.get('/', InternetMonitor.services) // /api/services




module.exports = {
    connection_data_router: connection_data_router,
    service_data_router: service_data_router
};