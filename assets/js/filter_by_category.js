function filterByCategory(id) {
	
	const circles = d3.selectAll("circle").filter("." + id);

	circles.transition().style("visibility", 
		(document.getElementById(id).checked) ? "visible" : "hidden");
}

function checkUncheckAll(id) {

	const checkbox = document.getElementById(id);

	if (checkbox.checked) {

		d3.selectAll(".article-category")
			.select("input")
			.property("checked", true)
			.dispatch("click");
	} else {

		d3.selectAll(".article-category")
			.select("input")
			.property("checked", false)
			.dispatch("click");
	}
}