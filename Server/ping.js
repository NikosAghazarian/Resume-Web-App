const mysql = require('mysql');
const Monitor = require('ping-monitor');
const ServerAuth = require('../ServerAuth.json');

const NORMAL_INTERVAL = 1;
const FAST_INTERVAL = NORMAL_INTERVAL;


const monitorHosts = ['www.blizzard.com/en-us/', 'github.com', 'www.amazon.com', 'www.nytimes.com', 'www.apple.com', 'www.cnn.com', 'www.ebay.com', 'www.microsoft.com/en-us'];

let monitorList = {
    'www.blizzard.com/en-us/': undefined,
    'www.github.com': undefined,
    'www.amazon.com': undefined,
    'www.nytimes.com': undefined,
    'www.apple.com': undefined,
    'www.cnn.com': undefined,
    'www.ebay.com': undefined,
    'www.microsoft.com/en-us': undefined
}


function PingMonitor(monitorHosts, monitorList, connectionType) {
    let type = connectionType === "wired" ? 1 : 2; // 1 is wired, 2 is wifi
    
    monitorHosts.forEach( (host) => {
        // npm ping-monitor

        let ping_monitor = new Monitor({
            website: 'https://' + host,
            interval: NORMAL_INTERVAL, // minutes
        });

        MonitorEventBuilder(ping_monitor);

        function MonitorEventBuilder(ping_monitor) { // builds events for individual monitors
            let timeout = 0;
            ping_monitor.on('up', (res) => {
                console.log(res.website + " is live: " + res.responseTime + "ms, " + connectionType);
                PingLogger(host, res.responseTime);
                if (timeout > NORMAL_INTERVAL) { // five minute continuous outage is when multiple responses are required to confirm stability
                    timeout -= 5;
                }
                else {
                    timeout = 0;
                }
            });
            ping_monitor.on('down', (res, state) => {
                console.log(res.website + " is down");
                console.log(res.website + " timeOut: " + timeout + " --- interval: " + state.interval);
                PingLogger(host, null);
                if (timeout > 10) {
                    console.log(res.website + " has been down for over 10 minutes.")
                }
                /* if (timeout === 0 && state.interval !== FAST_INTERVAL) { //for a rapid logging mode for 
                    pingMonitor = null;
                    let apiReplacement = new Monitor({
                        website: res.website,
                        interval: FAST_INTERVAL, // minutes, 0.5 === 1 ping/30 sec
                    });
                    MonitorEventBuilder(apiReplacement);
                    monitorList[res.website] = apiReplacement;
                } */
                timeout++;
            });
            ping_monitor.on('error', () => {
                console.error("err");
            });
        }
    
        // populates the object holding existing monitors
        monitorList[host] = ping_monitor; 
    });

    function PingLogger(service, ping) { 
        // ping = Number, connectionType = [wired|wifi], service = [www.blizzard.com/en-us/|github.com|www.amazon.com|www.nytimes.com]
        
        const connection = mysql.createConnection({
            host: ServerAuth.host,
            user: ServerAuth.user,
            password: ServerAuth.password,
        });

        connection.connect();

        let timestamp = Date.prototype.YYYYMMDDHHMMSS();

        let query = "INSERT INTO dev.pingconnectivity (Time, Service, Ping, Connection) VALUES ('"+timestamp+"', '"+service+"', '"+ping+"', '"+type+"')";
        
        connection.query(query, function (error, results, fields) {
            if (error) throw error;
        });
        
        connection.end();
    }
}


PingMonitor(monitorHosts, monitorList, 'wired');

PingMonitor(monitorHosts, monitorList, 'wifi');