$(document).ready(function() {

    new autoComplete({

        selector: 'input[name="article-search-bar"]',
        minChars: 1,
        source: function(term, response) {

            $.ajax({
                url: "https://en.wikipedia.org/w/api.php",
                dataType: "jsonp",
                data: {
                    'action': "opensearch",
                    'format': "json",
                    'search': term
                },
                success: function(data) {

                    response(data[1]);
                }
            })
        }
    });
});