// Color palette
const color_palette =  {"Arts": "#8dd3c7", "Culture": "#ffffb3", 
						"Education": "#bebada", "Events": "#fb8072",
						"Geography": "#80b1d3", "Health": "#fdb462",
						"History": "#b3de69", "Humanities":  "#fccde5",
						"Language": "#d9d9d9", "Law": "#bc80bd",
						"Life": "#ccebc5", "Mathematics": "#ffed6f"};

// TODO Find colors for "Nature", "People", "Philosophy", "Politics", 
//						"Reference", "Religion", "Science and Technology",
//						"Society", "Sports", "Universe", "World" 

class ArticleCategories {

   	constructor(category_list_id, data) {
		
		this.category_list_id = category_list_id;
		this.updateCategories(data);
	}

	getUniqueCategories(data) {

		// Get the list of all article categories (with duplicates)
   		const categories = data.map(x => x.categ);

		// Get the list of unique categories
		const unique_categories = 
			categories.filter((currentValue, index, arr) => 
								(arr.indexOf(currentValue) === index))
					  .sort();

	  	return unique_categories;
	}

	updateCategories(data) {

		// Get the list of unique categories
		const unique_categories = this.getUniqueCategories(data);	

		// Add a <li> element for each category
		const category_list = d3.select("#" + this.category_list_id);
		const u = category_list.selectAll(".article_category")
								.data(unique_categories, d => d);


		const li = u.enter()
					.append("li")
					.classed("article_category", true)
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
			.text(d => d);

		u.exit()
			.remove();
	}
}