// Color palette
const color_palette =  {"Arts": "#8dd3c7", "Culture": "#ffffb3", 
						"Education": "#bebada", "Events": "#fb8072",
						"Geography": "#80b1d3", "Health": "#fdb462",
						"History": "#b3de69", "Humanities":  "#fccde5",
						"Language": "#d9d9d9", "Law": "#bc80bd",
						"Life": "#ccebc5", "Mathematics": "#ffed6f"};

// TODO Find colors for "Nature", "People", "Philosophy", "Politics", 
//						"Reference", "Religion", "Science and Technology",
//						"Society", "Sports", "Universe", "World" 


// Read data from CSV file
let id = 0;
d3.dsv(",", "https://ividim.github.io/DataViz/data/test_pageviews.csv",
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
	const brush_area = d3.select("#scatterplot").append("g");

	let y = height + 3;
	let brushHeight = 20;

	const xBrushRange = [new Date(2013, 0, 1), new Date(2018, 0, 1)];
	const xBrushScale = d3.scaleTime()
	    				.domain(xBrushRange)
	    				.rangeRound([0, width]);

	brush_area.append("g")
	    .classed("axis axis--grid", true)
	    .attr("transform", "translate(0," + y + ")")
	    .call(d3.axisBottom(xBrushScale)
	        .ticks(d3.timeMonth)
	        .tickSize(brushHeight)
	        .tickFormat(function() { return null; }))
	  	.selectAll(".tick")
	    	.classed("tick--minor", d => (d.getMonth() != 0 
	    								&& d.getMonth() != 6));

  	let yy = y + brushHeight;
  	brush_area.append("g")
	    .classed("axis axis--x", true)
	    .attr("transform", "translate(0," + yy + ")")
	    .call(d3.axisBottom(xBrushScale)
	        .ticks(d3.timeYear)
	        .tickSize(5)
	        .tickPadding(0));

    let brush = d3.brushX()
		        .extent([[0, 0], [width, brushHeight]])
		        .on("end", brushed);

    brush_area.append("g")
	    .classed("brush", true)
	    .attr("transform", "translate(0," + y + ")")
	    .call(brush);

    function brushed() {

		// Only transition after input.
		if (!d3.event.sourceEvent) return;

		// Ignore empty selections.
		if (!d3.event.selection) return;

		let d0 = d3.event.selection.map(xBrushScale.invert),
	  	d1 = d0.map(d3.timeMonth.round);

		// If empty when rounded, use floor & ceil instead.
		if (d1[0] >= d1[1]) {

			d1[0] = d3.timeMonth.floor(d0[0]);
			d1[1] = d3.timeMonth.offset(d1[0]);
		}

		d3.select(this).transition()
			.call(d3.event.target.move, d1.map(xBrushScale));

		let new_data = scatterplot.updateCircles(d1, data);
		article_categories.updateCategories(new_data);
	}
}

class ScatterPlot {

	constructor(args) {
		
		const svg_element_id = args.svg_element_id;
		const data = args.data;
		const width = args.width;
		const height = args.height;
		
		// Ranges & Scales
		const xRange = [new Date(2012, 11, 1), new Date(2018, 1, 1)];
		const yRange = [0, d3.max(data, d => d.y) + 5];

		this.xScale = d3.scaleTime()
							.domain(xRange)
							.range([0, width - 1]);
		this.yScale = d3.scaleLinear()
							.domain(yRange)
							.range([height - 10, -10]);

		//Create scatterplot and surrounding g elements
		const svg = d3.select("#" + svg_element_id);

		this.focus_area = svg.append("g")
								.classed("focus", true);

		this.focus_area.append('rect')
					.attr("x", "0")
					.attr("y", "-10")
					.attr("width", width)
					.attr("height", height)
					.attr("id", "canvas");
					// .classed("zoom", true);

		// Create X axis
		let xAxisHeight = height - 10;
		this.xAxis = d3.axisBottom(this.xScale)
						.tickSize(2);

		this.focus_area.append("g")
						.classed("axis axis-x", true)
						.attr("transform", "translate(0," + xAxisHeight + ")")
		      			.call(this.xAxis);

		// Create Y axis
		this.yAxis = d3.axisLeft(this.yScale)
						.tickSize(2);

		this.focus_area.append("g")
						.classed("axis axis-y", true)
			      		.call(this.yAxis);	   	

		// Create article circles
		let circles = this.focus_area
							.selectAll("circle")
							// Bind each svg circle to a unique data element
							.data(data, d => d.id);

		circles.enter()
				.append("circle")
					.attr("r", 2.5)
					.attr("cx", d => this.xScale(d.x))
					.attr("cy", d => this.yScale(d.y))
					.attr("style", d => "fill: " + color_palette[d.categ])
					.attr("class", d => d.categ.toLowerCase())
					// Tooltip behaviour
					.on("mouseover", this.onMouseOver)					
			        .on("mouseout", this.onMouseOut)
					// Selected event behaviour
					// .classed("event-selected", d => d.sel == true);
					.classed("event-selected", d => d);
	}

	// Function to be called when user hovers over a circle - shows tooltip
	onMouseOver(d) {

		let format = d3.timeFormat("%B-%Y");

		this.div = d3.select("body")
					.append("div")	
				    .attr("class", "tooltip")				
				    .style("opacity", 0);

    	this.div.transition()		
            .duration(200)		
            .style("opacity", .9);

        this.div.html("<u> Article "+ d.name + "</u>" +
    					"<br/>" +
        				"Views: " + d.y +
    					"<br/>" +
        			 	"(" + format(d.x) + ")")	
           .style("left", d3.event.pageX - 30 + "px")		
           .style("top", d3.event.pageY - 60 + "px");
    }

    // Function to be called when user stops hovering over a circle
    onMouseOut(d) {

		this.div.transition()		
				.duration(500)
				.style("opacity", 0)
				.remove();
    }

	updateCircles(dom, data) {

		// Expand plot domain by two months, so that circles
		// won't fall on the plot's borders
		let domain = [];
		
		domain[0] = new Date(dom[0]);
		domain[0].setMonth(domain[0].getMonth() - 1);
		
		domain[1] = new Date(dom[1]);
		domain[1].setMonth(domain[1].getMonth() + 1);

		// Update xScale domain
		this.xScale.domain(domain);

		// Update data
		let new_data = data.filter(d => (d.x >= dom[0] && d.x <= dom[1]));

		// Update circles
		let circles = this.focus_area.selectAll("circle")
										// Bind each svg circle to a 
										// unique data element
										.data(new_data, d => d.id);

		// Update()
		circles.transition()
	            .attr("cx", d => this.xScale(d.x));

        // Enter() 
		circles.enter()
				.append("circle")
					.attr("r", 0)
					.attr("cx", d => this.xScale(d.x))
					.attr("cy", d => this.yScale(d.y))
					.attr("style", d => "fill: " + color_palette[d.categ])
					.attr("class", d => d.categ.toLowerCase())
					// Tooltip behaviour
					.on("mouseover", this.onMouseOver)					
			        .on("mouseout", this.onMouseOut)
					// selected events
					// .classed("event-selected", d => d.sel == true);
					.classed("event-selected", d => d)
  				.transition()
					.attr("r", 2.5);
		
		// Exit() 
		circles.exit()
				.transition()
					.attr("r", 0)
				.remove();

		// Update x axis
		this.focus_area.select(".axis.axis-x").call(this.xAxis);

		return new_data;
	}
}


class ArticleCategories {

   	constructor(category_list_id, data) {
		
		this.category_list_id = category_list_id;
		this.updateCategories(data);
	}

	getUniqueCategories(data) {

		// Get the list of all article categories (with duplicates)
   		const categories = data.map(x => x.categ);

		// Get the list of unique categories
		const unique_categories = 
			categories.filter((currentValue, index, arr) => 
								(arr.indexOf(currentValue) === index))
					  .sort();

	  	return unique_categories;
	}

	updateCategories(data) {

		// Get the list of unique categories
		const unique_categories = this.getUniqueCategories(data);	

		// Add a <li> element for each category
		const category_list = d3.select("#" + this.category_list_id);
		const u = category_list.selectAll(".article_category")
								.data(unique_categories, d => d);


		const li = u.enter()
					.append("li")
					.classed("article_category", true)
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

		u.exit()
			.remove();
	}
}