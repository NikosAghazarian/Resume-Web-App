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
    let type;
    switch (req.query.internetConnectionType) { // connection type to select for query
        case 'wired':
            type = 1;
            break;
        case 'wifi':
            type = 2;
            break;
        case 'all':
            type = 0;
            break;
        default:
            res.send('Invalid Query type');
            return;
    }

    let time;
    if (!req.query.time) {
        time = 4;
    }
    else {
        time = parseFloat(req.query.time);
    }
    if (typeof time !== 'number') {
        res.send('Not valid time.');
        return;
    }


    if (req.query.service) {
        let service; // expands service acronyms into the urls stored in DB
        switch (req.query.service) {
            case 'GIT':
                service = 'github.com';
                break;
            case 'BLZ':
                service = 'www.blizzard.com/en-us/';
                break;
            case 'NYT':
                service = 'www.nytimes.com';
                break;
            case 'AWS':
                service = 'www.amazon.com';
                break;
            case 'APL':
                service = 'www.apple.com';
                break;
            case 'CNN':
                service = 'www.cnn.com';
                break;
            case 'EBY':
                service = 'www.ebay.com';
                break;
            case 'MSF':
                service = 'www.microsoft.com/en-us';
                break;
            default:
                service = 'www.amazon.com';
        }

        var query = `SELECT * FROM dev.pingconnectivity WHERE Time > DATE_ADD(NOW(), INTERVAL -${time} HOUR) AND Service = ${service} AND Connection = ${type}`;
    }
    else if (type === 0) {
        var query = `SELECT * FROM dev.pingconnectivity WHERE Time > DATE_ADD(NOW(), INTERVAL -${time} HOUR)`
    }
    else {
        var query = `SELECT * FROM dev.pingconnectivity WHERE Time > DATE_ADD(NOW(), INTERVAL -${time} HOUR) AND Connection = ${type}`;
    }

    DbQuery(query, (error, results, fields) => {
        if (error) throw error;
        for (let row of results) {
            let time = row.Time;
            row.Time = time.getFullYear() + '-' +
                  pad2(time.getMonth() + 1) + '-' +
                  pad2(time.getDate()) + ' ' +
                  pad2(time.getHours()) + ':' +
                  pad2(time.getMinutes()) + ':' +
                  pad2(time.getSeconds());
        }
        //console.log(results);
        res.send(results);
        function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }
    });
}

exports.services = (req, res, next) => {

    let query = `SELECT DISTINCT Service FROM dev.pingconnectivity`;
    
    DbQuery(query, (error, results, fields) => {
        if (error) throw error;
        //console.log(results);
        res.send(results);
    });
}