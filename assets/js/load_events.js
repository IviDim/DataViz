let events;

d3.dsv(",", "https://raw.githubusercontent.com/justcho5/data_viz/" +
			"master/data/events_2013_2018_sorted.csv?" + 
			"token=ASnk-8Z75NnbosKBlTtiLVAM_Lu4OTI7ks5b_m2QwA%3D%3D",
	function(d) {

		return {
			event_id: d.id, 
			event_name: d.name,
			event_date: d.date,
			event_month_number: d.month,
			event_month: d.month2,
			event_year: d.year,
			event_category: d.category
		};
	})
.then (
	function(event_data) {		

		events = new Events(event_data);
	});

