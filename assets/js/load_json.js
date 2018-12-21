function loadJSON(url, callback, callback2) {

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {

        if (this.readyState == 4) {

            if (this.status == 200) {

                const data = JSON.parse(this.responseText);
                callback(data);
            } else {

                if (callback2 != undefined)
                    callback2();
            }
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
};