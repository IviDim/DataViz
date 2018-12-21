// Read data from REST API

function loadArticleNeighbours(article_name, callback) {

    const article_neighbours_url = "https://fivelinks.io/dataviz/links/";
    const url = article_neighbours_url + article_name;

    loadJSON(url, function (neighbours) {

        // Update neighbour names to ids
        neighbours = neighbours.map(n => convertToID(n))

        // For each neighbour of the selected article, create a link
        const links = [];
        const selected_circle = d3.select("#article_" +
            convertToID(article_name));

        neighbours.forEach(function (n) {

            // If a neighbour is not the selected article itself,
            // add a link to it.
            if (n !== convertToID(article_name)) {

                const neighbour = d3.select("#article_" + n);

                if (!neighbour.empty()) {

                    links.push({
                        'peak_date': selected_circle.data()[0].peak_date,
                        'view_count': selected_circle.data()[0].view_count
                    });
                    links.push({
                        'peak_date': neighbour.data()[0].peak_date,
                        'view_count': neighbour.data()[0].view_count
                    });
                }
            }
        });

        // Add selected article itself to neighbours.
        neighbours.push(convertToID(article_name));

        // If the selected node has no neighbours in this view,
        // show shaking animation.
        if (links.length == 0)
            shakeSelectedCircle(selected_circle);
        else
            updateArticleNeighboursView(neighbours, links, article_name);

    }, callback);


    // Create shaking animation for the selected circle.
    function shakeSelectedCircle(selected_circle) {

        const dur = 60;
        const offset = 0.5;
        const cx = selected_circle.attr("cx");
        selected_circle.transition()
            .duration(dur)
            .attr("cx", parseInt(cx) + offset)
            .transition()
            .duration(dur)
            .attr("cx", parseInt(cx) - offset)
            .transition()
            .duration(dur)
            .attr("cx", parseInt(cx) + offset)
            .transition()
            .duration(dur)
            .attr("cx", parseInt(cx) - offset)
            .transition()
            .duration(dur)
            .attr("cx", parseInt(cx) + offset)
            .transition()
            .duration(dur)
            .attr("cx", parseInt(cx) - offset)
            .transition()
            .duration(dur)
            .attr("cx", parseInt(cx));
    }
}

function updateArticleNeighboursView(nodes, links, article_name) {

    scatterplot.updateArticleNeighboursPlot(nodes, links, article_name);
}