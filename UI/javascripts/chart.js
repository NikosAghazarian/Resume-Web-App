google.charts.load('current', {packages: ['corechart', 'bar']});

window.onresize = drawChart; // RESIZES chart with window size


function getDbData(path) {
    /* 
    *  Handles and returns an XHR promise with a given path of the app
    */
    let url = `http://192.168.217.128:3000/${path}`;
    return new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();
        request.responseType = 'json';
        request.open('GET', url, true);
        request.onload = () => {
            let status = request.status;
            if (status >= 200 && status < 300) {
                resolve(request.response);
            } else {
                reject(request.statusText);
            }
        };
        request.onerror = () => {
            console.log(request.statusText);
        };
        request.send();
    });
}

async function generateDataArray(network) {
    let dataArray = [['Time']];

    let selectedServices = document.getElementById('service_select').value;
    let selectDistinctService;
    // This controls how many services are displayed
    if (selectedServices !== 'ALL') {
        switch(selectedServices) {
            case 'GIT':
                selectDistinctService = [{Service: 'github.com'}];
                break;
            case 'BLZ':
                selectDistinctService = [{Service: 'www.blizzard.com/en-us/'}];
                break;
            case 'NYT':
                selectDistinctService = [{Service: 'www.nytimes.com'}];
                break;
            case 'AWS':
                selectDistinctService = [{Service: 'www.amazon.com'}];
                break;
            default:
                selectDistinctService = [{Service: 'www.amazon.com'}];
        }
    }
    else {
        selectDistinctService = await getDbData('api/services'); // SELECT DISTINCT Service FROM dev.pingconnectivity_wired 
    }

    let selectedTimeStart = document.getElementById('start_time').value;

    //console.log(selectDistinctService);
    let selectServiceData = await getDbData(`api/connection?internetConnectionType=${network}&time=${selectedTimeStart}`); //SELECT * from last 4 hours
    //console.log(selectServiceData);

    for (let serviceObj of selectDistinctService ) {
        dataArray[0].push(serviceObj.Service); // populates labels
    }

    const ROW_SIZE = dataArray[0].length;
    let rowIdx = 0;
    let serviceCount = selectServiceData.length;

    for (let dataIdx = 0; dataIdx < serviceCount; dataIdx++) { // creates data rows (columns on the chart) labeled with timestamps, iterating over DB return
        
        let timestamp = selectServiceData[dataIdx].Time.replace(/[ZT]/g, ' '); // removes incorrect labels for timezone, prevents: "2019-08-08T02:09:14.000Z"
        let selectedDataCol = dataArray[0].indexOf(selectServiceData[dataIdx].Service);

        if (findSimilarDate(dataArray, timestamp) === -1) {
            rowIdx++;
            let row = Array(ROW_SIZE).fill(null);
            dataArray.push(row);
            dataArray[rowIdx][0] = timestamp; //[ [Time, lable, label], [2:45, null, null]] example expected
        }
        
        dataArray[rowIdx][selectedDataCol] = selectServiceData[dataIdx].Ping;
    }
    return dataArray;

    function findSimilarDate(datatableToSearch, query) {
    /*
    *  Returns the row index of a given date query in a given datatable
    */
        for (let i = datatableToSearch.length-1; i > 0; i--) { //iterates over datatable rows
            query = query.slice(0,17);
            regex = new RegExp(query+'[0-9][0-9].000');
            if (regex.test(datatableToSearch[i][0])) {
                return i;
            }
        }
        return -1;
    }
}

async function drawChart() {
    console.log('drawChart');
    let dataArray = await generateDataArray('wired');
    let data = google.visualization.arrayToDataTable(dataArray);

    let options = {
        title: 'Network Performance',
        width: '100%',
        curveType: 'function',
        legend: { position: 'bottom' },
        vAxis: { 
            title: 'Ping (ms)',
            viewWindow: {
                min: 0,
                max: document.getElementById('max_chart_y').value
            }
        }
    };

    let chart;
    try {
        chart = new google.visualization.LineChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    } catch (error) {
        console.log(error);
    }
}