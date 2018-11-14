
// TODO Change to actual data location
events = d3.csv("http://localhost:8000/events_2013_2018_sorted.csv", function(d) {
	
	return {
		event_id: d.id, 
		event_name: d.name,
		event_date: d.date,
		event_category: d.category
	};
});

console.log(events);