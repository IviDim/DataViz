const color_cycle = ["#F0EAD6", "#D2C29D", "#766F57", "#7F4145"];

function colorCycle(colors=color_cycle) {

	let index = -1;

	return () => {

		index = (index + 1) % colors.length;
		return colors[index];
	}
}

const cc = colorCycle();

function select_event(id, name) {
	
	const jumb = d3.select("#selected-events-jumb");
	const checkbox = document.getElementById("event" + id)

	if (checkbox.checked) {

		jumb.append("button")
			.classed("badge", true)
			.classed("badge-pill", true)
			.attr("id", "badge" + id)
			.attr("style", "background-color: " + cc())
			.attr("onclick", "remove_badge(" + id + ")")
			.text(name + " ")
		.append("i")
			.classed("fa", true)
			.classed("fa-times", true);
	} else {

		jumb.select("#badge" + id)
			.remove();
	}
}

function remove_badge(id) {

	d3.select("#selected-events-jumb")
		.select("#badge" + id)
		.remove();

	d3.select("#event" + id)
		.property("checked", false);
}