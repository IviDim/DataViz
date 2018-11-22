let color_list = ["#F0EAD6", "#D2C29D", "#766F57", "#7F4145"];

let num_selected = 0;
const max_selected = 4;

function select_event(id, name) {
	
	const jumb = d3.select("#selected-events-jumb");
	const checkbox = document.getElementById("event" + id)

	if (checkbox.checked) {

		jumb.append("button")
				.classed("badge", true)
				.classed("badge-pill", true)
				.attr("id", "badge" + id)
				.attr("style", "background-color: " + color_list[0])
				.attr("onclick", "remove_badge(" + id + ")")
				.text(name + " ")
			.append("i")
				.classed("fa", true)
				.classed("fa-times", true);
		
		// Remove color from color list
		color_list = color_list.slice(1);

		// Check if there are 4 selected events, and disable all others
		num_selected++;
		toggle_checkboxes();

	} else {

		const badge = jumb.select("#badge" + id);
		
		// Add background color back to the list
		color_list.push(badge.style("background-color"));

		badge.remove();

		// Check if there are less than 4 selected events, and re-enable all 
		// others
		num_selected--;
		toggle_checkboxes();
	}
}

function remove_badge(id) {

	const badge = d3.select("#selected-events-jumb")
					.select("#badge" + id);

	// Add background color back to the list
		color_list.push(badge.style("background-color"));

	badge.remove();

	d3.select("#event" + id)
		.property("checked", false);


	// Check if there are less than 4 selected events, and re-enable all 
	// others
	num_selected--;
	toggle_checkboxes();
}

function toggle_checkboxes() {

	if (num_selected >= max_selected) {

		d3.selectAll(".event-checkbox")
			.selectAll("input[type='checkbox']:not(:checked)")
			.property("disabled", true);

	} else if (num_selected == max_selected - 1) {

		d3.selectAll(".event-checkbox")
			.selectAll("input[type='checkbox']")
			.property("disabled", false);
	}
}