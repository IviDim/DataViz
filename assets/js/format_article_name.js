function cleanArticleName(article_name) {

    return article_name.replace(/_/g, " ") //Remove _
        .replace(/\\/g, ""); //Remove \
}

function convertToID(article_name) {

    // Replace all non alphanumeric characters with an underscore.
    return article_name.replace(/\W/g, "_");
}

// Make article name uri encoded.
function makeURIEncoded(article_name) {

    return article_name.replace(/\\/g, "")
        .replace(/[!'()*]/g, escape)
}