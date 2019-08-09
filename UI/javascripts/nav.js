function GetRoute(path) {
    console.log('getroute');
    const mainDivElement = document.getElementById('main');

    let route = `http://192.168.217.128:3000/${path}`;
    let request = new XMLHttpRequest();
    request.open('GET', route);

    request.onload = () => {
        //console.log(request.response);
        mainDivElement.innerHTML = request.response;
        if (path === 'InternetMonitor') {
            drawChart();
        }
    }
    request.onerror = () => {
        console.error(request.statusText);
        mainDivElement.innerHTML = request.statusText;
    }
    request.send();
    disableBtn(path);
}

function disableBtn(path) {
    let id;
    switch (path) {
        case '':
            id = 'navHome';
            break;
        case 'Home':
        case 'Greywater':
        case 'InternetMonitor':
            id = 'nav' + path;
            break;
        default:
            console.error('Bad nav bar path: ' + path);
            return
    }

    const btnList = document.getElementsByTagName('button');
    const locationBtn = btnList.namedItem(id);

    for (let btn of btnList) {
        btn.disabled = false;
        btn.addEventListener("keyup", (event) => {
            event.preventDefault();
            if (event.keyCode === 13) {
                btn.click();
                btn.toggleAttribute('active');
            }
        });
    }
    locationBtn.disabled = true;
}