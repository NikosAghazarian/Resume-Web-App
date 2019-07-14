const Monitor = require('ping-monitor');
const NORMAL_INTERVAL = 10;
const FAST_INTERVAL = 0.5;

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


