// Read data from CSV file
let id = 0;
d3.dsv(",", "https://raw.githubusercontent.com/justcho5/data_viz/" +
			"master/data/test_pageviews.csv?" + 
			"token=ASnk--RMF3Xk30-E9Q-IQeSTesrWk5l_ks5b_m19wA%3D%3D",
	function(d) {

		return {
			id: id++,
			name: d.article,
			x: new Date(d.year, d.month, 1),
			y: parseInt(d.views),
			categ: d.category,
			sel: true
		};
	})
.then (function(data) {

		createPlotAndCategories(data);
	}
);


function createPlotAndCategories(data) {

	// Dimensions
	const width = 400;
	const height = 255;
	
	// Scatterplot creation
	let scatterplot = new ScatterPlot({
						svg_element_id: "scatterplot",
						data: data,
						width: width,
						height: height
					});

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
		let new_data = scatterplot.updateCircles(domain, data);
		article_categories.updateCategories(new_data);
		// events.updateEvents(domain);
	}
}