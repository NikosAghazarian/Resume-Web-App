const mysql = require('mysql');
const Monitor = require('ping-monitor');
const ServerAuth = require('../ServerAuth.json');

const NORMAL_INTERVAL = 1;
const FAST_INTERVAL = NORMAL_INTERVAL;


const monitorHosts = ['www.blizzard.com/en-us/', 'github.com', 'www.amazon.com', 'www.nytimes.com'];

let monitorList = {
    'www.blizzard.com/en-us/': undefined,
    'www.github.com': undefined,
    'www.amazon.com': undefined,
    'www.nytimes.com': undefined
}

function PingMonitor() {
    monitorHosts.forEach( (host) => {
        // npm ping-monitor

        let pingMonitor = new Monitor({
            website: 'https://' + host,
            interval: NORMAL_INTERVAL, // minutes
        });

        MonitorEventBuilder(pingMonitor);

        function MonitorEventBuilder(pingMonitor) {
            let timeout = 0;
            pingMonitor.on('up', (res) => {
                console.log(res.website + " is live: " + res.responseTime + "ms");
                PingLogger(host, res.responseTime, 'wired');
                if (timeout > NORMAL_INTERVAL) { // five minute continuous outage is when multiple responses are required to confirm stability
                    timeout -= 5;
                }
                else {
                    timeout = 0;
                }
            });
            pingMonitor.on('down', (res, state) => {
                console.log(res.website + " is down");
                console.log(res.website + " timeOut: " + timeout + " --- interval: " + state.interval);
                PingLogger(host, null, 'wired');
                if (timeout > 10) {
                    console.log(res.website + " has been down for over 10 minutes.")
                }
                if (timeout === 0 && state.interval !== FAST_INTERVAL) {
                    pingMonitor = null;
                    let apiReplacement = new Monitor({
                        website: res.website,
                        interval: FAST_INTERVAL, // minutes, 0.5 === 1 ping/30 sec
                    });
                    MonitorEventBuilder(apiReplacement);
                    monitorList[res.website] = apiReplacement;
                }
                timeout++;
            });
            pingMonitor.on('error', () => {
                console.error("err");
            });
        }
    
        // populates the object holding existing monitors
        monitorList[host] = pingMonitor; 
    });
    function PingLogger(service, ping, connectionType) { 
        // ping = Number, connectionType = [wired|wifi], service = [www.blizzard.com/en-us/|github.com|www.amazon.com|www.nytimes.com]
        
        const connection = mysql.createConnection({
            host: ServerAuth.host,
            user: ServerAuth.user,
            password: ServerAuth.password,
        });

        connection.connect();

        let timestamp = Date.prototype.YYYYMMDDHHMMSS();

        let query = "INSERT INTO dev.pingconnectivity_"+connectionType+" (Time, Service, Ping) VALUES ('"+timestamp+"', '"+service+"', "+ping+")";
        
        connection.query(query, function (error, results, fields) {
            if (error) throw error;
        });
        
        connection.end();
    }
}




module.exports = {
    PingMonitor: PingMonitor
}