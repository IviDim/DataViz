class ScatterPlot {

	constructor(svg_element_id, data, width, height) {
		
		// Ranges & Scales
		const xRange = [new Date(2012, 11, 1), new Date(2018, 1, 1)];
		const yRange = [0, (d3.max(data, d => d.view_count)) + 100000];

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

		// Create and append X axis
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
						.tickSize(2)
						.tickFormat(function (d) {
					        
					        const prefix = d3.format("~s");
					        return prefix(d);
					    })
					    .tickPadding(6);

		//JUSTINA	

		// Color gradient for datapoints based on y scale
		const grad_scale = [yRange[0], (yRange[0] + yRange[1])/2, yRange[1]]
		const colors = ["#d7191c","#fdae61","#ffffbf","#abdda4","#2b83ba"];
		this.color_gradient = d3.scaleLinear()
								.domain(grad_scale)
								.range([colors[4], colors[2], colors[0]]);


		let legend_data = d3.range(yRange)
		let defs = this.focus_area.append('defs');
		let linearGradient = defs.append('linearGradient')
							 	 .attr('id', 'linear-gradient');

		linearGradient.attr("x1", "0%")
					  .attr("y1", "0%")
					  .attr("x2", "0%")
					  .attr("y2", "100%");

		linearGradient.selectAll("stop")
					  .data([	{offset: "0%", color: colors[0]},
						 		{offset: "50%", color: colors[2]},
						 		{offset: "100%", color: colors[4]},
					        ])
					  .enter()
					  .append("stop")
					  		.attr("offset", d => d.offset)
						  	.attr("stop-color", d => d.color);

      	 this.focus_area.append("rect")
      	 				.attr("x", -14)
      	 				.attr("y", -10)
      	 				.attr("width", 14)
      	 				.attr("height", height)
      	 				.style("fill", "url(#linear-gradient)");

		// Append Y axis
		this.focus_area.append("g")
						.classed("axis axis-y", true)
			      		.call(this.yAxis);

		// Create article circles
		let circles = this.focus_area
							.selectAll("circle")
							// Bind each svg circle to a unique data element
							.data(data, d => d.article_id);

		circles.enter()	
				.append("circle")
					.attr("id", d => "article_" + d.article_id)
					.attr("r", 2.5)
					.attr("cx", d => this.xScale(d.peak_date))
					.attr("cy", d => this.yScale(d.view_count))
					.attr("fill", d => this.color_gradient(d.view_count))
					.attr("class", d => d.main_category.toLowerCase()) //TODO Remove
					// Tooltip behaviour
					.on("mouseover", this.onMouseOver)					
			        .on("mouseout", this.onMouseOut)
					// Selected article behaviour
			        .on("click", this.onClick)
					// .classed("article-selected", d => d.sel == true);
					.classed("article-selected", d => d);

		//JUSTINA

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

		// Update circles
		let circles = this.focus_area.selectAll("circle")
										// Bind each svg circle to a 
										// unique data element
										.data(data, d => d.article_id);

		// Update()
		circles.transition()
	            .attr("cx", d => this.xScale(d.peak_date))
	            .attr("cy", d => this.yScale(d.view_count))
	            .attr("fill", d => this.color_gradient(d.view_count));

        // Enter() 
		circles.enter()
				.append("circle")
					.attr("id", d => "article_" + d.article_id)
					.attr("r", 0)
					.attr("cx", d => this.xScale(d.peak_date))
					.attr("cy", d => this.yScale(d.view_count))
					.attr("fill", d => this.color_gradient(d.view_count))
					.attr("class", d => d.main_category.toLowerCase())
					// Tooltip behaviour
					.on("mouseover", this.onMouseOver)					
			        .on("mouseout", this.onMouseOut)
			        // Selected article behaviour
			        .on("click", this.onClick)
					// .classed("article-selected", d => d.sel == true);
					.classed("article-selected", d => d)
  				.transition()
					.attr("r", 2.5);
		
		// Exit() 
		circles.exit()
				.transition()
					.attr("r", 0)
				.remove();

		// Update x axis
		this.focus_area.select(".axis.axis-x").call(this.xAxis);
	}


	// Function to be called when user hovers over a circle - shows tooltip
	onMouseOver(d) {

		// Highlight selected circle
		d3.select("#article_" + d.article_id)
			.transition()
			.attr("r", 2.7)
			.style("stroke", "Goldenrod")
			.style("stroke-width", "0.8");

		// TODO Not needed?
		// Highlight selected article from list
		// d3.select("#li_" + d.article_id)
		// 	.style("color", "grey")

		let dateFormat = d3.timeFormat("%d %b %Y");
		let viewsFormat = d3.format(",");

		this.div = d3.select("body")
					.append("div")
				    .attr("class", "tooltip")
				    .style("opacity", 0);

    	this.div.transition()
	            .duration(200)
	            .style("opacity", .9);

        this.div.html(  "<div><u>" + cleanArticleName(d.article_name) +
					  	"</u></div>" +
        				"Total views: " + viewsFormat(d.view_count) +
    					"<br/>" +
        			 	"Most viewed on: " + dateFormat(d.peak_date));

        const rect = d3.select("rect").node().getBoundingClientRect();
        const rectTopBorder = rect.top;
        const rectLeftBorder = rect.left;
        const rectRightBorder = rect.right;
        const circleLeft = $(this).offset().left;
        const circleTop = $(this).offset().top;
        const tooltipWidth = this.div.node().getBoundingClientRect().width;
        const tooltipHeight = this.div.node().getBoundingClientRect().height;

        // If the tooltip sticks out of the scatterplot's top border if
        // placed above the circle, it is placed under the circle instead.
        const tooltipTop = circleTop - 1.1 * tooltipHeight;
        if (tooltipTop < rectTopBorder)
        	this.div.style("top", circleTop + 0.4 * tooltipHeight + "px");
        else
        	this.div.style("top", tooltipTop + "px");
        

        const tooltipLeft = circleLeft - 0.4 * tooltipWidth;
		this.div.style("left", tooltipLeft + "px");
    }


    // Function to be called when user stops hovering over a circle
    onMouseOut(d) {

    	const circle = d3.select("#article_" + d.article_id);

    	// Bring selected circle to its initial form
		if (circle.classed("article-clicked") != true) {

			circle.transition()
					.attr("r", 2.5)
					.style("stroke", "#484747")
					.style("stroke-width", "0.2");

			// TODO Not needed?
			// Bring the corresponding article in the list to its
			// initial form
			// d3.select("#li_" + d.article_id)
			// 	.style("color", "#e6e6e6")
		}

		// Hide tooltip
		this.div.transition()		
				.duration(500)
				.style("opacity", 0)
				.remove();
    }

     // Function to be called when user clicks on a circle
    onClick(d) {

    	// Deselect other articles
    	const circles = d3.selectAll(".article-clicked")
    	circles.classed("article-clicked", false);
    	circles.dispatch("mouseout");

    	const circle = d3.select("#article_" + d.article_id);

		// Highlight selected circle
		circle.transition()
				.attr("r", 2.7)
				.style("stroke", "Goldenrod")
				.style("stroke-width", "0.8");
				
		circle.classed("article-clicked", true);

    	// Show article summary
    	d3.select("#article-summary")
			// .text(d.article_summary);   //TODO Bring back
			// TODO Remove
			.html("<div><u>" + cleanArticleName(d.article_name) + "</u></div>" +
				  "Lorem ipsum dolor sit amet, consectetur adipiscing" +
				  " elit, sed do eiusmod tempor incididunt ut labore" + 
				  " et dolore magna aliqua. Ut enim ad minim veniam," + 
				  " quis nostrud exercitation ullamco laboris nisi ut" + 
				  " aliquip ex ea commodo consequat. Duis aute irure" + 
				  " dolor in reprehenderit in voluptate velit esse " +
				  "cillum dolore eu fugiat nulla pariatur. " + 
				  "<a target='_blank' href='https://en.wikipedia.org/wiki/" + 
				  d.article_name + "'> (View more) </a>");
    }
}


