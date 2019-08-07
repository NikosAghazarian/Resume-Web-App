(function() {
    const btnList = document.getElementsByTagName('button');
    const locationBtn = btnList.namedItem('navGreywater');

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
})();

