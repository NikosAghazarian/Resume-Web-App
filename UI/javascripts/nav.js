const baseUrl = 'https://nikosaghazarian.herokuapp.com/';


/** 
 * Handles the page navigation via callbacks from button.
 * @param {string} path - The navigation url to add onto the base page url
*/
function GetRoute(path) {

    if (path === 'Resume') {
        window.location = baseUrl + 'Resume'
    }
    else {
        const mainDivElement = document.getElementById('main');

        let route = baseUrl + path;
        let request = new XMLHttpRequest();
        request.open('GET', route);

        request.onload = () => {
            mainDivElement.innerHTML = request.response;
        }
        request.onerror = () => {
            console.error(request.statusText);
            mainDivElement.innerHTML = `<h1>There has been an error in loading this content.</h1>`;
        }
        request.send();
        //disableBtn(path); DISABLED DUE TO NO USE CURRENT CASES
    }
}


/**
 * Disables the respective nav button when the internal page is already selected
 * @param {string} path - The navigation url to set as the current location
 */
function disableBtn(path) {
    let id;
    switch (path) {
        case '':
            id = 'navHome';
            break;
        case 'Home':
        case 'Resume':
            break;
        case 'Github':
            id = 'nav' + path;
            break;
        default:
            console.error('Bad nav bar path: ' + path);
            return
    }
    if (id !== undefined) {
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
}