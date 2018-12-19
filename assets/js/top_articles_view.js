
function whenDocumentLoaded(action) {

	if (document.readyState === "loading") {

		document.addEventListener("DOMContentLoaded", action);
	} else {
		
		action();
	}
}

whenDocumentLoaded(() => {

	// Set event listener for search bar
	const search_bar = document.getElementById("article-search-bar");
	search_bar.addEventListener("keyup", function(event) {

		// When user presses enter
	  	if (event.keyCode === 13) {
		    // click the same function as when the search button is pressed.
	    	onClickArticleSearch(d3.select("#article-search-bar"));
	  	}
	});

	loadTopArticlesView(initial_dates, initTopArticlesView);
});


function loadTopArticlesView(domain, callback) {

	// Load events from csv
	d3.dsv(",", "https://raw.githubusercontent.com/justcho5/data_viz/" +
			"master/data/events_2013_2018_sorted.csv?" + 
			"token=ASnk-8Z75NnbosKBlTtiLVAM_Lu4OTI7ks5b_m2QwA%3D%3D",
		function(d) {

			return {
				event_id: d.id, 
				event_name: d.name,
				event_date: d.date,
				event_month_number: d.month,
				event_month: d.month2,
				event_year: d.year,
				event_category: d.category
			};
		})
	.then (function(event_data) {		

		// Filter out events that fall outside the initial dates.
		event_data = event_data.filter(d => 
							new Date(d.event_date) >= initial_dates[0]);
		events = new Events(event_data);
	
		// Load articles from REST API
		// TODO Bring back 
		const articles_url = "https://fivelinks.io/dataviz/topArticles";
		// const articles_url = "http://0.0.0.0:5000/topArticles"; //TODO Remove

		if (domain == null)
			domain = initial_dates;

		const monthFormat = d3.timeFormat("%m");
		const yearFormat = d3.timeFormat("%Y");

		const url = articles_url + "/" + yearFormat(domain[0])
								 + "/" + monthFormat(domain[0])
								 + "/" + yearFormat(domain[1])	
								 + "/" + monthFormat(domain[1]);

		loadJSON(url, function(data) {

			// TODO Remove
			// Filter out article "-" and "404.php"
			data = data.filter(d => d.article_name != "-" && 
									d.article_name != "404.php");

			// Use each article's name as its id.
			data.forEach(d => d["article_id"] = convertToID(d["article_name"]));

			// Convert peak date string to a date
			data.forEach(d => d["peak_date"] = new Date(d["peak_date"]));

			// Sort data on ascending peak date and view count, so that
			// circles are visualized in a more ordered fashion.
			data.sort(function (d1, d2) {

				if (d1["peak_date"] < d2["peak_date"]) {

					return -1;
				}
				else if (d1["peak_date"] == d2["peak_date"]) {

					if (d1["view_count"] < d2["view_count"])
						return 1
					else if (d1["view_count"] == d2["view_count"])
						return 0
					else
						return -1;
				} else {

					return 1;
				}
			})

			// Convert peak date string to a date
			data.forEach(d => d["peak_date"] = new Date(d["peak_date"]));

			callback(domain, data);
		});
	});
}

function initTopArticlesView(domain, data) {

	// Dimensions
	const width = 400;
	const height = 200;
	
	// Scatterplot creation
	scatterplot = new ScatterPlot("scatterplot", data, width, height, domain);
	scatterplot.updateTopArticlesPlot(domain, data);

	// Brush area creation
	const brushHeight = 20;
	brush = d3.brushX()
        	  .extent([[0, 0], [width, brushHeight]])
              .on("end", brush_end);

	brush_area = new BrushArea(height + 3, width, brushHeight, 
								domain, brush);

	// Creation of list of top articles
	article_list = new ArticleList("list-top-articles", data);

	function brush_end() {

		// Only transition after input.
		if ((!ignore_event) && (!d3.event.sourceEvent)) return;

		// Ignore empty selections.
		if ((!ignore_event) && (!d3.event.selection)) return;

		// Refine brush selection and get domain
		const domain = brush_area.refineBrushSelection(this);

		// Update view appropriately.
		if (state === "TopArticles") 
			loadTopArticlesView(domain, updateTopArticlesView);
		else if (state === "SingleArticle")
			loadArticleProgress(null);
	}
}

function updateTopArticlesView(domain, data) {

	scatterplot.updateTopArticlesPlot(domain, data)
	article_list.updateArticleList(data);
}


function onClickArticleSearch(d) {

	function showErrorMessage() {

		const error_message = d3.select("#article-search-error-message");
		error_message.transition()
		  			 .style("height", "initial");

		error_message.transition()
					 .delay(1000)
					 .duration(1000)
		 			 .style("height", "0px");
	}
	
	const user_input = d.property("value");
	// If user input only contains whitespaces, do nothing.
	if (user_input.replace(/\s/g, "") != "") {

		const article_name = user_input.replace(/ /g, "_")
	   					   			   .replace(/'/g, "\\'");

		loadArticleProgress(article_name, showErrorMessage);
	}
}