function loadJSON(url, callback) {

	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {

        if (this.readyState == 4 && this.status == 200) {

            const data = JSON.parse(this.responseText);
            callback(data);
       }
    };

	xhttp.open("GET", url, true);
	xhttp.send();
};