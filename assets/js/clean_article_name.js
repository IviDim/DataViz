function cleanArticleName(article_name) {

	return article_name.replace(/_/g, " ") //Remove _
					   .replace(/\\/g, ""); //Remove \
}