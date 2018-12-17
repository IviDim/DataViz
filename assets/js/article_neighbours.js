// Read data from REST API

function loadArticleNeighbours(article_name, callback) {

	// TODO Use correct
	const article_neighbours_url = "...";

	const url = article_neighbours_url + article_name;
	 
  	// TODO Bring back 
	// loadJSON(url, function(neighbours) {

		// TODO Remove
		neighbours =  [{'node': 'Pope_Francis'},
		  			   {'node': 'Kim_Kardashian'},
				  	   {'node': 'Adolf_Hitler'},
				  	   {'node': 'World_War_I'},
				  	   {'node': 'Pokemon_Go'},
				  	   {'node': 'Emilia_Clarke'}
				 	  ];

		// For each neighbour of the selected article, create a link
		const links = [];
		const selected_circle = d3.select("#article_" + 
												convertToID(article_name));

		neighbours.forEach(function(n) {

			const neighbour = d3.select("#article_" + convertToID(n.node));

			if (!neighbour.empty()){

				links.push({'peak_date': selected_circle.data()[0].peak_date,
							 'view_count': selected_circle.data()[0].view_count});
 				links.push({'peak_date': neighbour.data()[0].peak_date,
		 	 				 'view_count': neighbour.data()[0].view_count});
			}
		});

		// Update neighbour names to ids
		neighbours.forEach(n => n.node = convertToID(n.node))
		neighbours.push({'node': convertToID(article_name)});

		// If the selected node has no neighbours in this view,
		// show shaking animation.
		if (links.length == 0)
			shakeSelectedCircle();

		// TODO Possibly not needed
		// Set state to single article view
		// state = "ArticleNeighbours";
		
		updateArticleNeighboursView(neighbours, links);

	// TODO Bring back
	// }, callback);


	function shakeSelectedCircle() {

		const dur = 60;
		const offset = 0.5;
		const cx = selected_circle.attr("cx");
		selected_circle.transition()
			           .duration(dur)
			           .attr("cx", parseInt(cx) + offset)
			           .transition()
			           .duration(dur)
			           .attr("cx", parseInt(cx) - offset)
			           .transition()
			           .duration(dur)
			           .attr("cx", parseInt(cx) + offset)
			           .transition()
			           .duration(dur)
			           .attr("cx", parseInt(cx) - offset)
			           .transition()
			           .duration(dur)
			           .attr("cx", parseInt(cx) + offset)
			           .transition()
			           .duration(dur)
			           .attr("cx", parseInt(cx) - offset)
			           .transition()
			           .duration(dur)
			           .attr("cx", parseInt(cx));
	}
}

function updateArticleNeighboursView(nodes, links) {

	scatterplot.updateArticleNeighboursPlot(nodes, links);
}