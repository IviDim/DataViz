class BrushArea {

	constructor(y, width, brushHeight, xBrushRange, brush) {

		this.brush_selection = null;

		const brush_area = d3.select("#scatterplot")
							 .append("g");
		brush_area.classed("brush-area");

		this.xBrushScale = d3.scaleTime()
		    				.domain(xBrushRange)
		    				.rangeRound([0, width]);

		brush_area.append("g")
		    .classed("axis axis--grid", true)
		    .attr("transform", "translate(0," + y + ")")
		    .call(d3.axisBottom(this.xBrushScale)
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
		    .call(d3.axisBottom(this.xBrushScale)
		        .ticks(d3.timeYear)
		        .tickSize(5)
		        .tickPadding(0));

	    brush_area.append("g")
			    .classed("brush", true)
			    .attr("transform", "translate(0," + y + ")")
			    .call(brush);
	}

	// Rounds brush selection to the first day of the first selected month
	// and the last day of the last selected month.
	refineBrushSelection(brush) {

		let d0 = d3.event.selection.map(this.xBrushScale.invert),
	  		d1 = d0.map(d3.timeMonth.round);

		// If empty when rounded, use floor & ceil instead.
		if (d1[0] >= d1[1]) {

			d1[0] = d3.timeMonth.floor(d0[0]);
			d1[1] = d3.timeMonth.offset(d1[0]);
		}

		// Set ignore_event to false, to avoid propagation of brush
		ignore_event = false;

		// Refine the selection
		d3.select(brush).transition()
			.call(d3.event.target.move, d1.map(this.xBrushScale));

		// Domain starts on the first day of the first selected month
		// and ends on the last day of the last selected month
		d1[1].setDate(d1[1].getDate() - 1);

		// Save brush selection
		this.brush_selection = d1;

		return d1;
	}


	setBrushSelection(domain) {

		const current_domain = this.brush_selection;

		// If current domain is null, the whole available period is selected
		// and we don't need to do anything.
		// if (current_domain != null) {

			// let dom = []
			let dom = domain;
			// dom[0] = Math.min(domain[0], current_domain[0]);
			// dom[1] = Math.max(domain[1], current_domain[1]);

	 		// Update value of stored brush selection
		    this.brush_selection = dom;

		    // Set ignore_event to true, to allow brush_end to run, without 
		    // input event.
		    ignore_event = true;

		 	// Move brush appropriately
		 	d3.select(".brush")
	 		  .transition()
	 		  .call(brush.move, [this.xBrushScale(dom[0]), 
	 		  					 this.xBrushScale(dom[1])]);
		// }
	}

	getBrushSelection() {

		return this.brush_selection;
	}
}