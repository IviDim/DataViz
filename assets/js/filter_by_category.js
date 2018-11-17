function filter_by_category(id) {
	
	console.log("Wow");
	const circles = d3.selectAll("circle").filter("." + id);

	circles.transition().style("visibility", 
		(document.getElementById(id).checked) ? "visible" : "hidden");
}