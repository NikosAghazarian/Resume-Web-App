(function() {
    const btnList = document.getElementsByTagName('button');
    const locationBtn = btnList.namedItem('navInternetMonitor');

    locationBtn.disabled = true;

    let btn;
    for (btn of btnList) {
        btn.addEventListener("keyup", (event) => {
            event.preventDefault();
            if (event.keyCode === 13) {
                btn.click();
                btn.toggleAttribute('active');
            }
        });
    }

    /* let route = '/api/services';
    let request = new XMLHttpRequest();
    request.open('GET', route);
    request.onload = () => {
        document.getElementById('main').innerHTML = request.response;
    };
    request.send(); */
})();

