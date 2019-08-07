google.charts.load('current', {packages: ['corechart', 'bar']});
google.charts.setOnLoadCallback(drawChart);

window.onresize = drawChart; // RESIZES chart with window size

function getDbData(path) {
    let route = `http://192.168.217.128:3000/${path}`;
    let request = new XMLHttpRequest();
    request.open('GET', route);

    let data = new Promise( (resolve, reject) => {
        request.onload = () => resolve(request.response);
        request.onerror = () => reject(request.statusText);
    });
    return data;
}

async function generateDataArray() {
    let dataArray = [['Time']];

    let path = 'api/connection?internetConnectionType=wired';
    let selectDistinctService = await getDbData(path); // SELECT DISTINCT Service FROM dev.pingconnectivity_wired 
    console.log(selectDistinctService);
    return;

    for (let item in /* of */ selectDistinctService) {
        dataArray[0].append(item /* result from select */); // POPULATES labels
    }
    
    for (let i = 1; i < 20; i++) { // CREATES data rows (columns on the chart) labeled with timestamps
        dataArray.append([new Date(/* avg of date1 and date2 */)]);
        // SELECT * FROM dev.pingconnectivity_wired WHERE Time BETWEEN date1 AND date2
        
        for (let item in /* of */ selectDistinctService) { // POPULATES rows
        dataArray[i].append(item);
        }
    }
    return dataArray
}

async function drawChart() {
    await generateDataArray();
    var data = google.visualization.arrayToDataTable([
        ['time', 'Blizzard', 'GitHub', 'AWS', 'NYT'],
        ['t1', 200, 400, 400, 500],
        ['t2', 100, 460, 300, 300],
        ['t3', 150, 300, 230, 200],
        ['t4', 140, 350, 200, 250]
    ]);

    var options = {
        title: 'Network Performance',
        width: '100%',
        curveType: 'function',
        legend: { position: 'bottom' }
    };
    
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    chart.draw(data, options);
}