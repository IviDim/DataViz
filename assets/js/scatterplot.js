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
						.tickSize(2)
						.ticks(6);

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
        			 	"(" + format(d.x) + ")");

        let width = this.div.node().getBoundingClientRect().width;
        let height = this.div.node().getBoundingClientRect().height;
    			
		this.div.style("left", $(this).offset().left - 0.4 * width + "px")
			    .style("top", $(this).offset().top - 1.1 * height + "px");

    }

    // Function to be called when user stops hovering over a circle
    onMouseOut(d) {

		this.div.transition()		
				.duration(500)
				.style("opacity", 0)
				.remove();
    }

	updateCircles(dom, data) {

		// Expand plot domain by 2 days, so that circles
		// won't fall on the plot's borders
		let domain = [];
		
		domain[0] = new Date(dom[0]);
		domain[0].setDate(domain[0].getDate() - 1);
		
		domain[1] = new Date(dom[1]);
		domain[1].setDate(domain[1].getDate() + 1);

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