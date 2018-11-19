class BrushArea {

	constructor(y, width, brushHeight, brush) {

		const brush_area = d3.select("#scatterplot").append("g");

		const xBrushRange = [new Date(2013, 0, 1), new Date(2018, 0, 1)];
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

	updateBrushArea(brush) {

		let d0 = d3.event.selection.map(this.xBrushScale.invert),
	  		d1 = d0.map(d3.timeMonth.round);

		// If empty when rounded, use floor & ceil instead.
		if (d1[0] >= d1[1]) {

			d1[0] = d3.timeMonth.floor(d0[0]);
			d1[1] = d3.timeMonth.offset(d1[0]);
		}

		d3.select(brush).transition()
			.call(d3.event.target.move, d1.map(this.xBrushScale));

		// Domain starts on the first day of the first selected month
		// and ends on the last day of the last selected month
		d1[1].setDate(d1[1].getDate() - 1);

		return d1;
	}
}