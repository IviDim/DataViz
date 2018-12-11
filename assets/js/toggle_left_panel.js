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