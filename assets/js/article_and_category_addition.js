// TODO Get from CSV
// Data
const pageviews = [50, 5, 30, 100, 80, 45];
const dates = ["2013-01-01", "2014-01-01", "2015-01-01", "2016-01-01", 
				"2017-01-01", "2017-12-31"];
const categories = ["Arts", "Culture", "Events", "Education", "Arts", 
					"Geography"]
const selected = [true, true, false, false, false, true];

// Color palette
const color_palette =  {"Arts": "#8dd3c7", "Culture": "#ffffb3", 
						"Education": "#bebada", "Events": "#fb8072",
						"Geography": "#80b1d3", "Health": "#fdb462",
						"History": "#b3de69", "Humanities":  "#fccde5",
						"Language": "#d9d9d9", "Law": "#bc80bd",
						"Life": "#ccebc5", "Mathematics": "#ffed6f"};

// TODO Find colors for "Nature", "People", "Philosohpy", "Politics", 
//						"Reference", "Religion", "Science and Technology",
//						"Society", "Sports", "Universe", "World" 

function whenDocumentLoaded(action) {

	if (document.readyState === "loading") {

		document.addEventListener("DOMContentLoaded", action);
	} else {

		action();
	}
}

// Dimensions
const width = 400;
const height = 255;

class ScatterPlot {

	constructor(svg_element_id, data) {
		
		// Calculate ranges
		const xRange = [new Date(2012, 11, 1), new Date(2018, 1, 1)];

		const yRange = [0, d3.max(data, d => d.y) + 5];

		const xDomain = d3.scaleTime()
	    					.domain(xRange)
							.range([0, width - 1]);

		const yDomain = d3.scaleLinear()
							.domain(yRange)
							.range([height - 10, -10]);

		//Create scatterplot
		this.svg = d3.select("#" + svg_element_id);

		this.plot_area = this.svg.append("g");

		this.plot_area.append('rect')
						.attr("x", "0")
						.attr("y", "-10")
						.attr("width", width)
						.attr("height", height)
						.attr("id", "canvas");

		// Create X axis
		let xAxisHeight = height - 10;
		let xAxis = d3.axisBottom(xDomain)
						.tickSize(2);

		this.svg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + xAxisHeight + ")")
      			.call(xAxis);

		// Create Y axis
		let yAxis = d3.axisLeft(yDomain)
						.tickSize(2);
		this.svg.append("g")
					.attr("class", "axis")
		      		.call(yAxis);

		// Create article circles
		this.plot_area.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
				.attr("r", 2.5)
				.attr("cx", d => xDomain(d.x))
				.attr("cy", d => yDomain(d.y))
				.attr("style", d => "fill: " + color_palette[d.categ])
				.attr("class", d => d.categ.toLowerCase())
				// selected events
				.classed("event-selected", d => d.sel == true);
	}
}

class BrushArea {

	constructor(svg_element_id, data) {

		//Create brush area
		this.plot_area = d3.select("#" + svg_element_id).append("g");

		let y = height + 3;
		let brushHeight = 20;

		let t1 = new Date(2013, 0, 1),
	    t2 = new Date(2018, 0, 1);

		let xDomain = d3.scaleTime()
	    				.domain([t1, t2])
	    				.rangeRound([5, width - 5]);

		this.plot_area.append("g")
		    .attr("class", "axis axis--grid")
		    .attr("transform", "translate(0," + y + ")")
		    .call(d3.axisBottom(xDomain)
		        .ticks(d3.timeMonth)
		        .tickSize(brushHeight)
		        .tickFormat(function() { return null; }))
		  	.selectAll(".tick")
		    	.classed("tick--minor", d => (d.getMonth() != 0 
		    								&& d.getMonth() != 6));

	  	let yy = y + brushHeight;
	  	this.plot_area.append("g")
		    .attr("class", "axis axis--x")
		    .attr("transform", "translate(0," + yy + ")")
		    .call(d3.axisBottom(xDomain)
		        .ticks(d3.timeYear)
		        .tickSize(5)
		        .tickPadding(0));

	    this.plot_area.append("g")
		    .attr("class", "brush")
		    .attr("transform", "translate(0," + y + ")")
		    .call(d3.brushX()
		        .extent([[0, 0], [width, brushHeight]])
		        .on("end", brush_end));

	    function brush_end() {

	    	 // Only transition after input.
	  		if (!d3.event.sourceEvent) return;

	  		// Ignore empty selections.
			if (!d3.event.selection) return;

			let d0 = d3.event.selection.map(xDomain.invert),
		  	d1 = d0.map(d3.timeMonth.round);

			// If empty when rounded, use floor & ceil instead.
			if (d1[0] >= d1[1]) {

				d1[0] = d3.timeMonth.floor(d0[0]);
				d1[1] = d3.timeMonth.offset(d1[0]);
			}

			d3.select(this).transition()
				.call(d3.event.target.move, d1.map(xDomain));
		}
	}
}

// TODO Move to another js file?
class ArticleCategories {

   	constructor(category_list_id, data) {

		// Get the list of all article categories (with duplicates)
   		const categories = data.map(x => x.categ);

		// Get the list of unique categories
		const unique_categories = 
			categories.filter((currentValue, index, arr) => 
								(arr.indexOf(currentValue) === index))
					  .sort();
		
		// Add a <li> element for each category
		const category_list = d3.select("#" + category_list_id);
		const li = category_list.selectAll(".article_category")
								.data(unique_categories)
								.enter()
								.append("li")
									.classed("list-group-item", true)
									.classed("inline-field", true);

		li.append("input")
			.attr("type", "checkbox")
			.attr("checked", "true")
			.attr("id", d => d.toLowerCase())
			.attr("onclick", 
				d => "filter_by_category('" + d.toLowerCase() + "')");

		li.append("label")
			.attr("for", d => d.toLowerCase())
			.attr("style", d => "color: " + color_palette[d])
			.classed("event-selected", true)
			.text(d => d);
	}
}

whenDocumentLoaded(() => {

	let data = [];

	pageviews.map((view, i) => [view, dates[i], selected[i], categories[i]])
		 	 .forEach((x, i) => 
 				data.push({"y": x[0], "x": new Date(x[1]), "name": i, 
 							"sel": x[2], "categ": x[3]}));

	const plot = new ScatterPlot("scatterplot", data);
	//TODO Check if we can pass categories directly, instead of data
	new ArticleCategories("category-filter", data);
	new BrushArea("scatterplot", data);
});

