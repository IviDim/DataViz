
class ScatterPlot {

	constructor(svg_element_id, data, width, height, xRange) {
		
		// Ranges & Scales
		const yRange = [0, (d3.max(data, d => d.view_count)) + 100000];
		this.yRange = yRange; //Save initial yRange

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

		// Create links area before circles area, so that links don't get
		// drawn above circles.
		this.links_area = svg.append("g")
							 .classed("links-area", true);

		this.circles_area = svg.append("g")
		 						.classed("circles-area", true);

		// Create and append X axis
		this.xAxisHeight = height - 10;
		this.xAxis = d3.axisBottom(this.xScale)
						.tickSize(2)
						.ticks(6);

		this.focus_area.append("g")
					   .classed("axis axis-x", true)
					   .attr("transform", "translate(0," + 
					   								this.xAxisHeight + ")")
	      			   .call(this.xAxis);

		// Create Y axis	
		this.yAxis = d3.axisLeft(this.yScale)
						.tickSize(2)
						.tickFormat(function (d) {
					        
					        const prefix = d3.format("~s");
					        return prefix(d);
					    })
					    .tickPadding(6);


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
      	 				.attr("id", "color-legend")
      	 				.attr("x", -14)
      	 				.attr("y", -10)
      	 				.attr("width", 14)
      	 				.attr("height", height)
      	 				.style("fill", "url(#linear-gradient)");

		// Append Y axis
		this.focus_area.append("g")
						.classed("axis axis-y", true)
			      		.call(this.yAxis);
	}

	updateTopArticlesPlot(dom, data) {

		// Update x axis
		this.updateXAxis(dom);

		// Note: In the top articles view, the y axis is kept fixed.

		// Update highlighted events
		this.updateHighlightedEvents();

		// Add color legend back, in case it has been removed
		d3.select("#color-legend")
		  .style("display", "initial");

	  	// Deselect selected circles
		const circles_clicked = d3.selectAll(".article-clicked");

		circles_clicked.attr("r", 2.5)
					   .style("stroke", "#484747")
					   .style("stroke-width", "0.2");

    	circles_clicked.classed("article-clicked", false);


		// Update circles
		let circles = this.circles_area.selectAll("circle")
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
					// Tooltip behaviour
					.on("mouseover", this.onMouseOverCircle)				
			        .on("mouseout", this.onMouseOutCircle)
			        // Selected article behaviour
			        .on("click", this.onClickCircle)
			        .on("contextmenu", this.onRightClickCircle)
  				.transition()
					.attr("r", 2.5);
		
		// Exit() 
		circles.exit()
				.transition()
					.attr("r", 0)
				.remove();
	}

	updateSingleArticlePlot(dom, data) {

		// Update x axis
		this.updateXAxis(dom);

		// Update y axis
		this.updateYAxis(data);

		// Update highlighted events
		this.updateHighlightedEvents();

		// Remove color legend
		d3.select("#color-legend")
		  .style("display", "none");

		// Remove previous lines
		d3.selectAll(".line")
			.remove();

		// Generate new line
		let line = d3.line()
		    		.x(d => this.xScale(d.peak_date))
		    		.y(d => this.yScale(d.view_count))
		    		.curve(d3.curveMonotoneX);

		// Animate addition of new line
		const path = this.focus_area.append("path")
					      			.attr("d", line(data))
					      			.attr("class", "line");

	    const totalLength = path.node().getTotalLength();

	    path.attr("stroke-dasharray", totalLength + " " + totalLength)
			.attr("stroke-dashoffset", totalLength)
			.transition()
			.duration(1000)
			.attr("stroke-dashoffset", 0);


		// Update circles
		let circles = this.focus_area.selectAll("circle")
									 // Bind each svg circle to a 
									 // unique data element
									 .data(data, d => d.article_id);

		// Update()
		circles.transition()
	            .attr("cx", d => this.xScale(d.peak_date))
	            .attr("cy", d => this.yScale(d.view_count));


        // Enter() 
		circles.enter()
				.append("circle")
					.attr("id", d => "article_" + d.article_id)
					.attr("r", 0)
					.attr("cx", d => this.xScale(d.peak_date))
					.attr("cy", d => this.yScale(d.view_count))
					.attr("fill", "#a50f15")
					// Tooltip behaviour
					.on("mouseover", this.onMouseOverCircle)					
			        .on("mouseout", this.onMouseOutCircle)
  				.transition()
					.attr("r", 2);

		// Exit() 
		circles.exit()
				.transition()
					.attr("r", 0)
				.remove();
    }

    updateArticleNeighboursPlot(nodes, links) {

    	// Highlight selected article and neighbours
    	nodes.forEach(function(n) {

    		const c = d3.select("#article_" + n.node)
    					.classed("article-clicked", true);

			c.transition()
  			 .attr("r", 2.7)
			 .style("stroke", "Goldenrod")
			 .style("stroke-width", "0.8");

    	})

		// Generate links
		const line = d3.line()
	    				.x(d => this.xScale(d.peak_date))
		    			.y(d => this.yScale(d.view_count));

		// Animate addition of new links
		const path = this.links_area
						 .append("path")
						 .attr("d", line(links))
						 .classed("link", true)
						 .attr("id", (d, i) => "link_" + i)
					  	 .attr("stroke", "Goldenrod")
				      	 .attr("stroke-opacity", 0.6)
				      	 .attr("stroke-width", 1);

	 	const totalLength = path.node().getTotalLength();

	    path.attr("stroke-dasharray", totalLength + " " + totalLength)
			.attr("stroke-dashoffset", totalLength)
			.transition()
			.duration(1000)
			.attr("stroke-dashoffset", 0);
    }


    updateXAxis(dom) {

    	// Expand plot domain by 2 days, so that circles  //TODO Remove?
		// won't fall on the plot's borders
		let domain = [];
		
		domain[0] = new Date(dom[0]);
		domain[0].setDate(domain[0].getDate() - 1);
		
		domain[1] = new Date(dom[1]);
		domain[1].setDate(domain[1].getDate() + 1);

		// Deselect selected events that don't fall inside the selected 
		// domain.
		selected_events_list.forEach(
			function (e) {
				if (e.domain[0] < domain[0] ||
	  			 		e.domain[1] > domain[1]) {

					events.deselectEvent(e.event_id);
				}
			})

		// Update xScale domain
		this.xScale.domain(domain);

		// Update x axis
		this.focus_area.select(".axis.axis-x").call(this.xAxis);

		// Hide any trailing links between circles
		d3.selectAll(".link")
	   	  .transition()
	   	  .style("stroke-opacity", "0")
	   	  .remove();
    }

    resetYAxis() {

    	// Update yScale domain
    	this.yScale.domain(this.yRange);
    	// Update y axis
		this.focus_area.select(".axis.axis-y").call(this.yAxis);
    }

    updateYAxis(data) {

    	let max_value = d3.max(data, d => d.view_count);

    	if (max_value > 1000000)
    		max_value += 100000
    	else if (max_value > 100000)
    		max_value += 10000
    	else
    		max_value += 1000

    	const domain = [0, max_value];

		// Update yScale domain
		this.yScale.domain(domain);

		// Update y axis
		this.focus_area.select(".axis.axis-y").call(this.yAxis);
    }


    updateHighlightedEvents() {

    	const highlighted_areas = this.focus_area
						    	.selectAll(".event-highlight")
						    	.data(selected_events_list, d => d.event_id);

    	// Update()
    	highlighted_areas.transition()
    					 .duration(500)
    					 .attr("x", d => this.xScale(d.domain[0]))
    					 .attr("width", d => this.xScale(d.domain[1]) - 
				    						 this.xScale(d.domain[0]));

    	// Enter()
		highlighted_areas.enter()    	
				    	 .append("rect")
				    	 .classed("event-highlight", true)
				    	 .attr("id", d => "highlight_" + d.event_id)
				    	 .attr("x", d => this.xScale(d.domain[0]))
				    	 .attr("y", this.xAxisHeight - 2)
				    	 .attr("width", d => this.xScale(d.domain[1]) - 
				    						 this.xScale(d.domain[0]))
				    	 .attr("height", 5)
				    	 .style("fill", d => d.color)
				    	 .style("opacity", "0")
				    	 .on("click", events.showEventDomain)
				    	 .transition()
				    	 .duration(500)
				    	 .style("opacity", "0.7");

		// Exit()
		highlighted_areas.exit()
						 .transition()
						 .duration(500)
						 .style("opacity", "0")
						 .remove();
    }

    // --------- On-event callbacks -------//

    // Function to be called when user clicks on a circle
    onClickCircle(d) {

    	// Deselect other articles
    	const circles_clicked = d3.selectAll(".article-clicked")
    	circles_clicked.classed("article-clicked", false);

    	const selected_circle = d3.select("#article_" + d.article_id);

		// Highlight selected circle
		selected_circle.transition()
				.attr("r", 2.7)
				.style("stroke", "Goldenrod")
				.style("stroke-width", "0.8");
				
		selected_circle.classed("article-clicked", true);

		// Prepare and load single article view
   		// scatterplot.transitionToSingleArticleView(d.article_name);
   		loadArticleProgress(d.article_name);
    }


    // Function to be called when user clicks on a circle
    onRightClickCircle(d) {
				
    	loadArticleNeighbours(d.article_name);
    }

	// Function to be called when user hovers over a circle - shows tooltip
	onMouseOverCircle(d) {

		const circle = d3.select("#article_" + d.article_id);

		if (circle.classed("deleted") == false) {

			// Highlight selected circle
			d3.select("#article_" + d.article_id)
				.transition()
				.duration(100)
				.attr("r", 3)
				.style("stroke", "Goldenrod")
				.style("stroke-width", "0.8");

			// Show tooltip
			let dateFormat = d3.timeFormat("%d %b %Y");
			let viewsFormat = d3.format(",");

			this.div = d3.select("body")
						.append("div")
					    .attr("class", "tooltip")
					    .style("opacity", 0);

	    	this.div.transition()
		            .duration(200)
		            .style("opacity", .9);

            let str = "Most viewed on: ";
            if (state === "SingleArticle")
            	str = "On: ";

	        this.div.html(  "<div><u>" + cleanArticleName(d.article_name) +
						  	"</u></div>" +
	        				"Total views: " + viewsFormat(d.view_count) +
	    					"<br/>" +
	        			 	str + dateFormat(d.peak_date));

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
    }


    // Function to be called when user stops hovering over a circle
    onMouseOutCircle(d) {

    	const circle = d3.select("#article_" + d.article_id);

    	// Bring selected circle to its initial form
		if (circle.classed("article-clicked") != true) {

			let r = 2.5;
            if (state === "SingleArticle")
            	r = 2;

			circle.transition()
					.attr("r", r)
					.style("stroke", "#484747")
					.style("stroke-width", "0.2");
		}

		// Hide tooltip
		this.div.transition()		
				.duration(500)
				.style("opacity", 0)
				.remove();
    }


    onClickArticleSearch(d) {

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

		const article_name = user_input.replace(/ /g, "_")
  				   					   .replace(/'/g, "\\'");

		loadArticleProgress(article_name, showErrorMessage);
	}
}




