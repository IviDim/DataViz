class ArticleList {

	constructor(article_list_id, data) {

		this.article_list_id = article_list_id;
		this.updateArticleList(data);
	}

	updateArticleList(data) {

		// Re-sort data in descending view count order
		data.sort(function (d1, d2) {
			return d3.descending(d1.view_count, d2.view_count)
		});

		// Add a <li> element for each article
		const article_list = d3.select("#" + this.article_list_id)
							   .select(".scrollable");
		const u = article_list.selectAll(".article-li")
								.data(data, d => d.view_count);

		// Enter()
		u.enter()
			.append("li")
				.attr("id", d => "li_" + d.article_id)
				.classed("article-li", true)
				.classed("list-group-item", true)
				.classed("hyphenated", true)
				.on("mouseover", this.onMouseOver)
				.on("mouseout", this.onMouseOut)
				.on("click", this.onClick)
			.append("span")
				.text((d, i) => (i+1) + ". " + 
								cleanArticleName(d.article_name))

		// Exit()
		u.exit()
			.remove();
	}


	// On click of a list element, show single article view, like when the
	// user clicks on a circle.
	onClick(d) {

		scatterplot.onClickCircle(d);
	}

	onMouseOver(d) {

		const circle = d3.select("#article_" + d.article_id);

		// If the circle has not already been deleted or is due for deletion,
		// highlight it.
		if ((!circle.empty()) && (circle.classed("deleted") == false)) {

			// TODO Remove?
			// Highlight selected circle
			// circle.transition()
			// 	  .duration(10)
			// 	  .attr("r", circle_radius + 0.2)
			// 	  .style("stroke", "Goldenrod")
			// 	  .style("stroke-width", "0.8");

			// Highlight circle and show scatterplot, like when the user
			// hovers over a circle.
			circle.dispatch("mouseover");
		}
	}

	onMouseOut(d) {

		// TODO Remove?
    	// Bring selected circle to its initial form
   //  	d3.select("#article_" + d.article_id)
			// .transition()
			// .attr("r", circle_radius)
			// .style("stroke", "#484747")
			// .style("stroke-width", "0.2");

		// Bring selected circle to its initial form, like when the user
		// hovers out of a circle.
		const circle = d3.select("#article_" + d.article_id);
		circle.dispatch("mouseout");
	}
}