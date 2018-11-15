
d3.dsv(",", "https://ividim.github.io/DataViz/data/events_2013_2018_sorted.csv",
	function(d) {

		return {
			event_id: d.id, 
			event_name: d.name,
			event_date: d.date,
			event_month: d.month2,
			event_year: d.year,
			event_category: d.category
		};
	})
.then (
	function(events) {		

		const categories = 
					["Politics", "Social", "Science", "Sports", "Viral"];

		// Append a checkbox for each event, in the appropriate category
		categories.map(categ => events.filter(
							x => x.event_category === categ))
					.forEach(function(arr, index) {

			const li = d3.select("#events-" + categories[index].toLowerCase())
						.select(".card-body")
						.select("ul")
						.selectAll(".event-checkbox")
						.data(arr)
						.enter()
						.append("li")
							.classed("list-group-item", true)
							.classed("event-checkbox", true)
							.classed("inline-field", true);
				
			li.append("input")
				.attr("type", "checkbox")
				.attr("id", d => "event" + d.event_id)
				.attr("onclick", 
					d => 'select_event(' + d.event_id + ',"' 
											+ d.event_name + '")');


			li.append("label")
				.attr("for", d => "event" + d.event_id)
				.text(d => d.event_name + 
					" [" + d.event_month + " " + d.event_year +"]");
		});
	});

