const mysql = require('mysql');
const PingMonitor = require('./ping.js').PingMonitor;
const express = require('express');

let app = express();
let port = process.env.PORT || 3000;

app.listen(port);
console.log('RESTful API started on: ' + port);


PingMonitor();




const connection = mysql.createConnection({
    host: 'Nikos-Desktop',
    user: 'InternetMonitor',
    password: 'monitor',
});

connection.connect();
let timestamp = Date.prototype.YYYYMMDDHHMMSS();
let query = "SELECT DISTINCT Service FROM dev.pingconnectivity_wired";

connection.query(query, (error, results, fields) => {
    if (error) throw error;
    console.log(results[0].Service);
});

connection.end();