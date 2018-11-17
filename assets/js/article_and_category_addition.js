// TODO Get from CSV
// Data
const pageviews = [50, 0, 30, 100, 80, 45];
const years = ["2013", "2014", "2015", "2016", "2017", "2018"];
const categories = ["Arts", "Culture", "Events", "Education", "Arts", 
					"Geography"]
const selected = [true, true, false, false, false, true];

// Color palette
const color_palette =  {"Arts": "#8dd3c7", "Culture": "#ffffb3", 
						"Education": "#bebada", "Events": "#fb8072",
						"Geography": "#80b1d3", "Health": "#fdb462",
						"History": "#b3de69", "Humanities":  "#fccde5",
						"Language": "#d9d9d9", "Law": "#bc80bd",
						"Life": "#ccebc5", "Mathematics": "#ffed6f"};

// TODO Find colors for "Nature", "People", "Philosohpy", "Politics", 
//						"Reference", "Religion", "Science and Technology",
//						"Society", "Sports", "Universe", "World" 

function whenDocumentLoaded(action) {

	if (document.readyState === "loading") {

		document.addEventListener("DOMContentLoaded", action);
	} else {

		action();
	}
}

class ScatterPlot {

	constructor(svg_element_id, data) {

		this.data = data;
		
		// Calculate ranges
		const x_value_range = [d3.min(data, d => d.x), d3.max(data, d => d.x)];

		const y_value_range = [0, d3.max(data, d => d.y)];

		const pointX_to_svgX = d3.scaleLinear()
			.domain(x_value_range)
			.range([10, 390]);

		const pointY_to_svgY = d3.scaleLinear()
			.domain(y_value_range)
			.range([240, 0]);

		//Create scatterplot
		this.svg = d3.select("#" + svg_element_id);

		this.plot_area = this.svg.append("g");

		this.plot_area.append('rect')
			.attr("x", "0")
			.attr("y", "-10")
			.attr("width", "400")
			.attr("height", "260")
			.attr("id", "canvas");

		this.plot_area.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
				.attr("r", 2.5)
				.attr("cx", d => pointX_to_svgX(d.x))
				.attr("cy", d => pointY_to_svgY(d.y))
				.attr("style", d => "fill: " + color_palette[d.categ])
				.attr("class", d => d.categ.toLowerCase())
				.classed("event-selected", d => d.sel == true); // selected events

		// Create X labels
		this.svg.append("g")
			.selectAll("text")
			.data(data)
			.enter()
				.append("text")
				.text( d => d.name )
				.attr("x", d => pointX_to_svgX(d.x))
				.attr("y", 260);

		// Create Y labels
		const label_ys = Array.from(Array(11), (elem, index) => 10 * index)
						.reverse(); // 100 ... 20 10 0

		this.svg.append("g")
			.selectAll("text")
			.data(label_ys)
			.enter()
				.append("text")
				.text( svg_y => svg_y)
				.attr("x", -5)
				.attr("y", svg_y => pointY_to_svgY(svg_y));
	}
}

// TODO Move to another js file?
class ArticleCategories {

   	constructor(category_list_id, data) {

		// Get the list of all article categories (with duplicates)
   		const categories = data.map(x => x.categ);

		// Get the list of unique categories
		const unique_categories = 
			categories.filter((currentValue, index, arr) => 
								(arr.indexOf(currentValue) === index))
					  .sort();
		
		// Add a <li> element for each category
		const category_list = d3.select("#" + category_list_id);
		const li = category_list.selectAll(".article_category")
								.data(unique_categories)
								.enter()
								.append("li")
									.classed("list-group-item", true)
									.classed("inline-field", true);

		li.append("input")
			.attr("type", "checkbox")
			.attr("checked", "true")
			.attr("id", d => d.toLowerCase())
			.attr("onclick", 
				d => "filter_by_category('" + d.toLowerCase() + "')");

		li.append("label")
			.attr("for", d => d.toLowerCase())
			.attr("style", d => "color: " + color_palette[d])
			.classed("event-selected", true)
			.text(d => d);
	}
}

whenDocumentLoaded(() => {

	let data = [];

	pageviews.map((view, i) => [view, years[i], selected[i], categories[i]])
				 	 .forEach((x, i) => 
		 				data.push({"y": x[0], "x":i, "name": x[1], 
		 							"sel": x[2], "categ": x[3]}));


	const plot = new ScatterPlot("scatterplot", data);
	//TODO Check if we can pass categories directly, instead of data
	new ArticleCategories("category-filter", data);
});

