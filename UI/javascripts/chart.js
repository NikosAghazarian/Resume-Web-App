google.charts.load('current', {packages: ['corechart', 'bar']});

window.onresize = resize; // RESIZES chart with window size

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

/*     let type;
    switch (network) { // connection type to select for query
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
    } */
    let selectDistinctService;
    if (network !== 'all') {
        let selectedServices = document.getElementById(`service_select_${network}`).value;
        // This controls which services are displayed
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
                case 'APL':
                    selectDistinctService = [{Service: 'www.apple.com'}];
                    break;
                case 'CNN':
                    selectDistinctService = [{Service: 'www.cnn.com'}];
                    break;
                case 'EBY':
                    selectDistinQctService = [{Service: 'www.ebay.com'}];
                    break;
                case 'MSF':
                    selectDistinctService = [{Service: 'www.microsoft.com/en-us'}];
                    break;
                default:
                    selectDistinctService = [{Service: 'www.amazon.com'}];
            }
        }
    }

    selectDistinctService = await getDbData(`api/services?internetConnectionType=${network}`); // SELECT DISTINCT Service FROM dev.pingconnectivity_wired 
    
    for (let serviceObj of selectDistinctService ) { // populates labels
        dataArray[0].push(serviceObj.Service); 
    }
    

    let connectionTypeKey = [null]; // 1D array holding the connection type of each  
    const selectedTimeStart = document.getElementById('start_hour').value;
    const selectServiceData = await getDbData(`api/connection?internetConnectionType=${network}&time=${selectedTimeStart}`); //SELECT * from last x hours
    const ROW_SIZE = dataArray[0].length;
    let rowIdx = 0;
    let serviceCount = selectServiceData.length;

    for (let dataIdx = 0; dataIdx < serviceCount; dataIdx++) { // creates data rows (columns on the chart) labeled with timestamps, iterating over DB return
        
        let timestamp = selectServiceData[dataIdx].Time;
        let selectedDataCol = dataArray[0].indexOf(selectServiceData[dataIdx].Service);

        let matchType = selectServiceData[dataIdx].Connection;

        if (findSimilarDate(dataArray, timestamp, matchType) === -1) { // if no similar date found, create new row, and advance the current row index
            rowIdx++;
            connectionTypeKey.push(matchType); // new row needs connection type key
            let row = Array(ROW_SIZE).fill(null); // preallocate row to maintain square 2D array
            dataArray.push(row);
            dataArray[rowIdx][0] = timestamp; //[ [Time, lable, label], [2:45, null, null]] example expected
        }
        
        dataArray[rowIdx][selectedDataCol] = selectServiceData[dataIdx].Ping;
    }

    if (document.getElementById('average_check').checked || document.getElementById('merge_average').checked) { // this averages the rows
        dataArray[0] = ['Time', `Average of Selected Service(s) on ${network} network`];
        const ROW_COUNT = dataArray.length;
        let reducer = (accumulator, currVal) => accumulator + currVal;
        for (let row = 1; row < ROW_COUNT; row++) {
            let newRow = [dataArray[row].shift()];
            newRow.push( dataArray[row].reduce(reducer) / (ROW_SIZE-1) );
            dataArray[row] = newRow;
        }
    }
    if (document.getElementById('merge_average').checked) {
        /*
         *   at this point, both sets of averages are in the same array,
         *   and they just need to be merged into the same rows,
         *   much of the code below will copy from above to create a new dataArray
         */
        var mergedDataArray = [['Time', 'Average on wired network', 'Average on wifi network']];
        const MERGED_ROW_SIZE = mergedDataArray[0].length;
        const DATA_ROW_COUNT = dataArray.length;
        let rowIdx = 0;
        //console.log(dataArray);
        for (let dataArrayIdx = 1; dataArrayIdx < DATA_ROW_COUNT; dataArrayIdx++) { // creates data rows (columns on the chart) labeled with timestamps, iterating over DB return
            //console.log("rowIdx: " + rowIdx);
            //console.log("dataArrayIdx: " + dataArrayIdx);
            let timestamp = dataArray[dataArrayIdx][0];
            let selectedDataCol = connectionTypeKey[dataArrayIdx];

            if (findSimilarDate(mergedDataArray, timestamp) === -1) { // if no similar date found, create new row, and advance the current row index
                rowIdx++;
                let row = Array(MERGED_ROW_SIZE).fill(null); // preallocate row to maintain square 2D array
                mergedDataArray.push(row);
                mergedDataArray[rowIdx][0] = timestamp; // [[Time, lable, label], [2:45, null, null]] example expected
            }
            
            mergedDataArray[rowIdx][selectedDataCol] = dataArray[dataArrayIdx][1];
        }

        return mergedDataArray;
    }

    return dataArray;
    
    function findSimilarDate(datatableToSearch, query, matchType = -1) {
        /*
        *  Returns the row index of a given date query in a given datatable, if none found of same type returns -1
        */
        for (let i = datatableToSearch.length-1; i > 0; i--) { //iterates over datatable rows
            query = query.slice(0,17);
            regex = new RegExp(query+'[0-9][0-9]');
            if (matchType !== -1) {
                if (regex.test(datatableToSearch[i][0]) && connectionTypeKey[i] === matchType) {
                    return i;
                }
            } else {
                if (regex.test(datatableToSearch[i][0])) {
                    return i;
                }
            }    
        }
        return -1;
    }
}


let data_wired;
let data_wifi;
let data_merged;

function resize(event) {
    drawChart(false)
}

async function drawChart(updateCall) {
    console.log('drawChart');
    if (!document.getElementById('chart_div_wired')) { // stops execution if there is no chart div to use
        return;
    }

    let dataArray_wired;
    let dataArray_wifi;
    if (updateCall || typeof data_wired !== 'object') { // optimizes for resize calls to prevent recalculations
        if (!document.getElementById('merge_average').checked) {
            dataArray_wired = await generateDataArray('wired');
            dataArray_wifi = await generateDataArray('wifi');

            data_wired = google.visualization.arrayToDataTable(dataArray_wired);
            data_wifi = google.visualization.arrayToDataTable(dataArray_wifi);
        }
        else {
            dataArray_merged = await generateDataArray('all');
            data_merged = google.visualization.arrayToDataTable(dataArray_merged);
        }
    }

    const options = {
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

    // these draw the chart to the appropriate chart divs
    if (document.getElementById('merge_average').checked) {
        let chart;

        swapGraphsDisplayed(true);

        try {
            chart = new google.visualization.LineChart(document.getElementById('chart_div_merged'));
            chart.draw(data_merged, options);
        } catch (error) {
            console.log(error);
        }
    }
    else {
        let chart_wired;
        let chart_wifi;

        swapGraphsDisplayed(false);

        try {
            chart_wired = new google.visualization.LineChart(document.getElementById('chart_div_wired'));
            chart_wired.draw(data_wired, options);

            chart_wifi = new google.visualization.LineChart(document.getElementById('chart_div_wifi'));
            chart_wifi.draw(data_wifi, options);
        } catch (error) {
            console.log(error);
        } 
    }
}

function swapGraphsDisplayed(toMerged) {
    if (toMerged) {
        let revealList = document.getElementsByClassName('mergedNetworkElements');
        for (let elem of revealList) {
            elem.classList.remove('hide');
        }
        let hideList = document.getElementsByClassName('individualNetworkElements');
        for (let elem of hideList) {
            elem.classList.add('hide');
        }
    }
    else {
        let revealList = document.getElementsByClassName('individualNetworkElements');
        for (let elem of revealList) {
            elem.classList.remove('hide');
        }
        let hideList = document.getElementsByClassName('mergedNetworkElements');
        for (let elem of hideList) {
            elem.classList.add('hide');
        }
    }
}