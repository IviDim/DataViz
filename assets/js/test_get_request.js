const url = "https://wikimedia.org/api/rest_v1/metrics/pageviews/top" + 
			"/en.wikipedia.org/all-access/2016/08/all-days";

const N = 10;

$(document).ready(function() {

	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {

        if (this.readyState == 4 && this.status == 200) {

        	const articles = JSON.parse(this.responseText).items[0].articles;
            articles.filter((x, index) => index < N)
            		.forEach(x => console.log(x));
       }
    };

	xhttp.open("GET", url, true);
	xhttp.send();
});