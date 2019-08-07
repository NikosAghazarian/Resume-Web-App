const mysql = require('mysql');
const ServerAuth = require('../../ServerAuth.json');


function DbQuery(query, queryCallback) {
    const connection = mysql.createConnection({
        host: ServerAuth.host,
        user: ServerAuth.user,
        password: ServerAuth.password,
    });
    connection.connect();
    connection.query(query, queryCallback);
    connection.end();
}

exports.connection_data = (req, res, next) => {
    if (req.query.internetConnectionType !== 'wired' && req.query.internetConnectionType !== 'wifi') {
        res.send('Invalid Query type');
        return;
    }

    let query = `SELECT * FROM dev.pingconnectivity_${req.query.internetConnectionType}`;

    DbQuery(query, (error, results, fields) => {
        if (error) throw error;
        console.log(results);
        res.send(results);
    });
}

exports.services = (req, res, next) => {
    let query = `SELECT DISTINCT Service FROM dev.pingconnectivity_wired`;

    DbQuery(query, (error, results, fields) => {
        if (error) throw error;
        console.log(results);
        res.send(results);
    });
}