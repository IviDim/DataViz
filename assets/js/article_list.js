class ArticleList {

	constructor(article_list_id, data) {

		this.article_list_id = article_list_id;
		this.updateArticleList(data);
	}

	updateArticleList(data) {

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
			.append("span")
				.text((d, i) => (i+1) + ". " + 
								cleanArticleName(d.article_name))

		// Exit()
		u.exit()
			.remove();
	}

	onMouseOver(d) {

		// Highlight selected circle
		d3.select("#article_" + d.article_id)
			.transition()
			.attr("r", 2.7)
			.style("stroke", "Goldenrod")
			.style("stroke-width", "0.8");
	}

	onMouseOut(d) {

    	// Bring selected circle to its initial form
    	d3.select("#article_" + d.article_id)
			.transition()
			.attr("r", 2.5)
			.style("stroke", "#484747")
			.style("stroke-width", "0.2");
	}
}