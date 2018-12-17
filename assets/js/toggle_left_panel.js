function toggleNav() {

	const left_panel = d3.select("#left-panel");
	const content = d3.select("#left-panel-content");
	const content_width = parseFloat(content.style("width")
											.replace(/px/g, ""));
	const new_width = content_width + 1 + "px";

	if (left_panel.style("width") == "0px") {

		left_panel.transition()
				  .duration(500)
				  .style("width", new_width);
	} else {

		left_panel.transition()
				  .duration(500)
				  .style("width", "0px");
	}
}

// Close left panel, when user clicks outside of it
$(document).mouseup(function(e) {

	const left_panel_d3 = d3.select("#left-panel");
	const left_panel = $("#left-panel");
	const panel_button = $("#toggle-panel-btn");

	if ((!left_panel.is(e.target)) && 
		(left_panel.has(e.target).length === 0) &&
		(!panel_button.is(e.target))) {

		left_panel_d3.transition()
			  .duration(500)
			  .style("width", "0px");
	}

});