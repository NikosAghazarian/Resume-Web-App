module.exports = function(app) {
    let InternetMonitor = require('../controllers/InternetMonitorController');
    app.route('./data')
        .get(InternetMonitor.STUFF)
        .post(InternetMonitor.MORESTUFF);

    app.route('./data/:reqID')
        .get()
        .put()
        .delete();
}