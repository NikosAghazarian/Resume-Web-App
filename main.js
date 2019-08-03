const Monitor = require('ping-monitor');
const mysql = require('mysql');

const NORMAL_INTERVAL = 10;
const FAST_INTERVAL = 0.5;

Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSS', { // creates a method on Date object for formatted date return
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

const monitorHosts = ['www.blizzard.com/en-us/', 'github.com', 'www.amazon.com', 'www.nytimes.com'];

let monitorList = {
    'www.blizzard.com/en-us/': undefined,
    'www.github.com': undefined,
    'www.amazon.com': undefined,
    'www.nytimes.com': undefined
}

monitorHosts.forEach( (host) => {
    //npm ping-monitor
    let api = new Monitor({
        website: 'https://' + host,
        interval: NORMAL_INTERVAL, // minutes
    });
    eventDecl(api);
    function eventDecl(api) {
        let timeout = 0;
        api.on('up', (res) => {
            console.log(res.website + " is live: " + res.responseTime + "ms");
            PingLogger(host, res.responseTime, 'wired');
            if (timeout > NORMAL_INTERVAL) { // five minute continuous outage is when multiple responses are required to confirm stability
                timeout -= 5;
            }
            else {
                timeout = 0;
            }
        });
        api.on('down', (res, state) => {
            console.log(res.website + " is down");
            console.log(res.website + " timeOut: " + timeout + " --- interval: " + state.interval);
            PingLogger(host, 0, 'wired');
            if (timeout > 20) {
                console.log(res.website + " has been down for over 10 minutes.")
            }
            if (timeout === 0 && state.interval !== FAST_INTERVAL) {
                api = null;
                let apiReplacement = new Monitor({
                    website: res.website,
                    interval: FAST_INTERVAL, // minutes, 0.5 === 1 ping/30 sec
                });
                eventDecl(apiReplacement);
                monitorList[res.website] = apiReplacement;
            }
            timeout++;
        });
        api.on('error', () => {
            console.error("err");
        });
    }

    monitorList[host] = api;
});

function PingLogger(service, ping, connectionType) { // ping = Number, connectionType = [wired|wifi], service = [www.blizzard.com/en-us/|github.com|www.amazon.com|www.nytimes.com]
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'InternetMonitor',
        password: 'monitor',
    });
    connection.connect();
    let timestamp = Date.prototype.YYYYMMDDHHMMSS();
    let query = "INSERT INTO dev.pingconnectivity_"+connectionType+" (Time, Service, Ping) VALUES ('"+timestamp+"', '"+service+"', "+ping+")";
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        //console.log(results);
        //console.log(fields);
    });
    
    connection.end();
}

const { exec } = require('child_process');
exec('npm -v', (error,stdout,stderr) => { //sudo ifconfig NETWORK_NAME down for linux
    if (error) {
        console.error(error);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
});
