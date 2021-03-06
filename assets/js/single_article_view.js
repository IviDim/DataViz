// Read data from REST API

function loadArticleProgress(article_name, callback) {

    if (article_name != null)
        loadArticleProgress.article_name = article_name;

    const daily_views_url = "https://wikimedia.org/api/rest_v1/metrics/pageviews/" +
        "per-article/en.wikipedia.org/desktop/user/";

    const monthFormat = d3.timeFormat("%m");
    const yearFormat = d3.timeFormat("%Y");
    const dayFormat = d3.timeFormat("%d");

    // Get domain from brush
    let domain = brush_area.getBrushSelection();

    // If no area is selected in the brush, aka we are in the initial top
    // articles view, we set the domain to the maximum range of dates for
    // which we have data.
    if (domain == null)
        domain = initial_dates;

    // Set end date to the last day of next month of domain[1], so that we
    // also get the  view count at the end of domain[1]'s month.
    const end_date = new Date(yearFormat(domain[1]))
        .setMonth(domain[1].getMonth() + 2, 0);

    const url = daily_views_url + makeURIEncoded(loadArticleProgress.article_name)
        + "/monthly/"
        + yearFormat(domain[0])
        + monthFormat(domain[0])
        + dayFormat(domain[0]) + "/"
        + yearFormat(end_date)
        + monthFormat(end_date)
        + dayFormat(end_date);


    loadJSON(url, function (data) {

        // Set state to single article view
        state = "SingleArticle";

        // Do transition actions, only if a new article name is
        // given.
        if (article_name != null)
            initSingleArticleView(article_name);

        updateSingleArticleView(domain, data);
    }, callback);
}

function initSingleArticleView(article_name, callback) {

    function clearPlot() {

        // Delete all circles to prepare for single article view
        const circles = d3.selectAll("circle");
        circles.classed("deleted", true);

        circles.transition()
            .duration(200)
            .style("opacity", "0");

        circles.remove();

        // Remove all trailing tooltips
        d3.selectAll(".tooltip")
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove();

        // Delete path, if it exists
        d3.selectAll(".line")
            .transition()
            .duration(200)
            .style("opacity", 0)
            .remove();
    }

    function returnToTopArticles() {

        state = "TopArticles";

        // Reset Y axis, to initial values.
        scatterplot.resetYAxis();

        // Show list of top articles
        d3.select("#list-top-articles")
            .transition()
            .duration(500)
            .style("height", "80vh");

        // Hide article summary
        d3.select("#article-summary")
            .html("");

        this.remove();

        // Clear everything from plot
        clearPlot();

        const domain = brush_area.getBrushSelection();
        loadTopArticlesView(domain, updateTopArticlesView);
    }

    function showArticleSummary(article_name) {

        // Hide list of top articles
        d3.select("#list-top-articles")
            .transition()
            .duration(500)
            .style("height", "0px");

        // Hide article summary
        d3.select("#article-summary")
            .html("");

        // Append close button
        const close_button = d3.select("#article-summary")
            .append("div")
            .style("word_wrap", "normal")
            .style("width", "100%")
            .append("button")
            .attr("type", "button")
            .classed("btn", true)
            .classed("btn-light", true)
            .attr("id", "return-top-articles")
            .on("click", returnToTopArticles)
            .append("i")
            .classed("fas fa-chevron-left", true);

        close_button.text(" Back to top articles");

        // Append article name
        const sum = d3.select("#article-summary")
            .append("div")
            .attr("id", "summary-text");
        sum.append("br");
        sum.append("div")
            .style("font-size", "18px")
            .append("u")
            .text(cleanArticleName(article_name));

        // Prepare "not found" message, just in case.
        const not_found = "<br> Sorry, we couldn't find a summary for " +
            " this page.";

        // Send request to get summary
        const summary_url = "https://fivelinks.io/dataviz/summary/" +
            article_name;

        loadJSON(summary_url, function (text) {

            // If summary is found, show it, else show "not found" message.
            if (text.length > 0) {

                const summary_text = "<br>" + text[0].summary +
                    "<a target='_blank' " +
                    "href='https://en.wikipedia.org/wiki/" +
                    makeURIEncoded(article_name) + "'> " +
                    "(View more) </a>";

                // Append article summary
                sum.append("div")
                    .style('padding', '0 10px')
                    .html(summary_text);

            } else {

                const message = not_found + "<br>" +
                    "<a target='_blank' " +
                    "href='https://en.wikipedia.org/wiki/" +
                    makeURIEncoded(article_name) + "'> " +
                    "(View page) </a>";

                // Append not found message
                sum.append("div")
                    .html(message);
            }

            // If loadJSON function returns 404, show "not found message".
        }, function () {

            // Append not found message
            sum.append("div")
                .html(not_found);
        });
    }

    // Show article summary
    showArticleSummary(article_name);

    // Clear everything from plot
    clearPlot();
}


function updateSingleArticleView(domain, data) {

    function parseDate(str) {

        return new Date(str.substring(0, 4),
            str.substring(4, 6) - 1,
            str.substring(6, 8));
    }

    // Preprocess JSON
    data = data["items"];
    data.forEach(function (d) {

        // Each article's id is its name and timestamp
        d.article_id = convertToID(d.article) + "_" + d.timestamp;

        d.article_name = d.article;
        delete d.article;

        d.view_count = d.views;
        delete d.views;

        d.peak_date = parseDate(d.timestamp);
        delete d.timestamp;
    });

    // Update scatterplot
    scatterplot.updateSingleArticlePlot(domain, data);
}
