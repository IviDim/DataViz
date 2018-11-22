const categories = ["Politics", "Social", "Science", "Sports", "Viral"];

class Events {

	constructor(events) {

		this.events = events;
		this.updateEvents();
	}

	updateEvents(timePeriod) {

		// Update data if needed
		let new_events
		if (timePeriod === undefined)
			//If no timePeriod is passed, we take all available events
			new_events = this.events;
		else
			// Otherwise, we only take events that fall inside the 
			// given time period
			new_events = this.events.filter(d => 
							new Date(d.event_date) >= timePeriod[0] &&
							new Date(d.event_date) <= timePeriod[1]);

		// Append a checkbox for each event, in the appropriate category
		categories.map(categ => new_events.filter(
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
						d => 'select_event(' + d.event_id + ',"' 
												+ d.event_name + '")');


			li_enter.append("label")
					.attr("for", d => "event" + d.event_id)
					.text(d => d.event_name + 
						" [" + d.event_month + " " + d.event_year +"]");

			// Exit()
			li.exit()
				.remove();
		});
	}
}