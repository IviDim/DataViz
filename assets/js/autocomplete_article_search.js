
$(document).ready(function() {

    new autoComplete({

        selector: 'input[name="article-search-bar"]',
        minChars: 1,
        source: function(term, response) {

            const script = document.createElement('script');

            const url = "https://en.wikipedia.org/w/api.php?" + 
                      "action=opensearch&format=json&formatversion=2" + 
                      "&search=" + term + "&namespace=0&limit=10&suggest=true";

            script.src = url;


            document.body.appendChild(script);

            // console.log(script);
            response(script);


            // $.getJSON(url, 
            //           { q: term }, function(data) { 

            //                         response(data[1]); 
            //                     }
            //          );

            // loadJSON(url, function(data) {

            //     response(data[1]);
            // })
        }
    });
});