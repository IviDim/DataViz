// Read data from REST API

const articles_url = "https://fivelinks.io/dataviz/topArticles";
 
function whenDocumentLoaded(action) {

	if (document.readyState === "loading") {

		document.addEventListener("DOMContentLoaded", action);
	} else {
		
		action();
	}
}

whenDocumentLoaded(() => {

	const url = articles_url + "/2014/10/2015/03";
	loadJSON(url, createPlotAndCategories);
});


function createPlotAndCategories(data) {

	// TODO Remove
	data.forEach(d => d["peak_date"] = createRandomDate());
	data.forEach(d => d["main_category"] = assignRandomCategory());

	// Dimensions
	const width = 400;
	const height = 255;
	
	// Scatterplot creation
	let scatterplot = new ScatterPlot("scatterplot", data, width, height);

	// Category creation
	let article_categories = new ArticleCategories("category-filter", data);

	//Brush area creation
	let brushHeight = 20;
	let brush = d3.brushX()
			        .extent([[0, 0], [width, brushHeight]])
			        .on("end", brushed);

	let brush_area = new BrushArea(height + 3, width, brushHeight, brush);

    function brushed() {

		// Only transition after input.
		if (!d3.event.sourceEvent) return;

		// Ignore empty selections.
		if (!d3.event.selection) return;

		const domain = brush_area.updateBrushArea(this);

		let monthFormat = d3.timeFormat("%m");
		let yearFormat = d3.timeFormat("%Y");

		const url = articles_url
					+ "/" + yearFormat(domain[0])
					+ "/" + monthFormat(domain[0])
				 	+ "/" + yearFormat(domain[1])
				 	+ "/" + monthFormat(domain[1]);

		loadJSON(url, function(data) {

			// TODO Remove
			data.forEach(d => d["peak_date"] = createRandomDate(domain));
			data.forEach(d => d["main_category"] = assignRandomCategory());

			scatterplot.updateCircles(domain, data)
			article_categories.updateCategories(data);
		});
		
		// events.updateEvents(domain);  //TODO Remove if not needed.
	}
}

//TODO Remove
function createRandomDate(dom) {

	let domain = [new Date(2014, 9, 1), new Date(2015, 2, 31)];
	if (dom !== undefined) {

		if (dom[0] > domain[0]) domain[0] = dom[0];
		if (dom[1] < domain[1]) domain[1] = dom[1]; 
	}

	return new Date(domain[0].getTime() + 
			Math.random() * (domain[1].getTime() - domain[0].getTime()));
}

//TODO Remove
function assignRandomCategory() {

	
	const categories = [ "Arts", "Culture", "Education", "Events",
						 "Geography", "Health", "History", "Humanities",
						 "Language", "Law", "Life", "Mathematics"];

	return categories[Math.round(Math.random() * 11)];
}