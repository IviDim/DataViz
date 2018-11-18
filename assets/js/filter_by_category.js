function filter_by_category(id) {
	
	const circles = d3.selectAll("circle").filter("." + id);

	circles.transition().style("visibility", 
		(document.getElementById(id).checked) ? "visible" : "hidden");
}