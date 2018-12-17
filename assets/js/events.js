class Events {

	constructor(event_data) {

		const categories = ["Politics", "Social", "Science", "Sports", "Viral"];
		this.color_stack = ["#7F4145", "#766F57", "#D2C29D", "#DEB887"]
		this.num_selected = 0;
		this.max_selected = 1;
		this.cc = colorCycle(this.color_stack);

		// Append a checkbox for each event, in the appropriate category
		categories.map(categ => event_data.filter(
											x => x.event_category === categ))
					.forEach(function(arr, index) {

			const li = d3.select("#events-" + categories[index].toLowerCase())
						.select(".card-body")
						.select("ul")
						.selectAll(".event-checkbox")
						.data(arr, d => d.event_id);
						
			// Enter()
			const li_enter = li.enter()
								.append("li")
									.classed("list-group-item", true)
									.classed("event-checkbox", true)
									.classed("inline-field", true);
						
			li_enter.append("input")
					.attr("type", "checkbox")
					.attr("id", d => "event" + d.event_id)
					.attr("onclick", 
						d => "events.onClickEventCheckbox('" 
													+ d.event_id + "', '" 
											 		+ d.event_name + "', '"
											 		+ d.event_date + "')");

			li_enter.append("label")
					.attr("for", d => "event" + d.event_id)
					.text(d => d.event_name + 
						" [" + d.event_month + " " + d.event_year +"]");

			// Exit()
			li.exit()
				.remove();
		});
	}


	onClickEventCheckbox(id, name, event_date) {
	
		const checkbox = document.getElementById("event" + id)

		if (checkbox.checked)
			this.selectEvent(id, name, event_date);
		else
			this.deselectEvent(id);
	}

	selectEvent(id, name, event_date) {

		const jumb = d3.select("#selected-events-jumb");

		// TODO Remove, if we will allow the selection of multiple events
		// Deselect previously selected events
		d3.selectAll(".event-badge")
			.dispatch("click");

		// Get color from the top of the color stack
		const color = this.color_stack.pop();

		// Add event badge to jumbotron
		jumb.append("button")
				.classed("badge", true)
				.classed("badge-pill", true)
				.classed("event-badge", true)
				.attr("id", "badge" + id)
				.attr("style", "background-color: " + color)
				.attr("onclick", "events.deselectEvent(" + id + ")")
				.text(name + " ")
			.append("i")
				.classed("fa", true)
				.classed("fa-times", true);

		// TODO Bring back if we will allow multiple selected events
		// Check if the selected events are the maximum possible, and 
		// disable all others
		// this.num_selected++;
		// this.enableDisableCheckboxes();

		// Determine event's domain
		const monthFormat = d3.timeFormat("%m");
		const yearFormat = d3.timeFormat("%Y");
		const date = new Date(event_date);

		const domain = [new Date(yearFormat(date),
								 monthFormat(date) - 1,
								 1),
						new Date(yearFormat(date),
								 monthFormat(date),
								 0)];

		// Add selected event to list
		selected_events_list.push({'event_id': id, 
						  		   'domain': domain, 
					     		   'color': color});

		// TODO Is it needed here?
		// Update highlighted events
		// scatterplot.updateHighlightedEvents();

		// Update brush appropriately, so that the new event is included.
		brush_area.setBrushSelection(domain);
	}

	deselectEvent(id) {

		const jumb = d3.select("#selected-events-jumb");
		const badge = jumb.select("#badge" + id);
		
		// Add background color back to the stack
		this.color_stack.push(badge.style("background-color"));

		// Remove badge from jumbotron
		badge.remove();

		// Uncheck checkbox, if not already unchecked
		d3.select("#event" + id)
		  .property("checked", false);

	  	// TODO Bring back if we will allow multiple selected events 
		// Check if there are less than the maximum selected events, and 
		// re-enable all others
		// this.num_selected--;
		// this.enableDisableCheckboxes();

		// Remove event from list
		selected_events_list = selected_events_list.filter(
										e => e.event_id != id);

		// Update highligted events 
		scatterplot.updateHighlightedEvents();
	}

	showEventDomain(d) {

		// Find event in list of selected events
		const event = selected_events_list.filter(
										e => e.event_id == d.event_id);

		// Update brush, according to its domain
		brush_area.setBrushSelection(event[0].domain);
	}

	// TODO Remove?
	enableDisableCheckboxes() {

		if (this.num_selected >= this.max_selected) {

			d3.selectAll(".event-checkbox")
				.selectAll("input[type='checkbox']:not(:checked)")
				.property("disabled", true);

		} else if (this.num_selected == this.max_selected - 1) {

			d3.selectAll(".event-checkbox")
				.selectAll("input[type='checkbox']")
				.property("disabled", false);
		}
	}

}