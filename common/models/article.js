module.exports = function(Article) {

    Article.pullFeed = function(source_id, cb){

        /*
         * Method to pull feeds from a particular source
         */

        var Source = Article.app.models.Source;
        Source.findById(source_id, function(err, source){
            var http = require('http');
            var parser = require('xml2json');

            http.get(source.url, function(res){
                var body = '';

                res.on('data', function(chunk){
                    body += chunk;
                });

                res.on('end', function(){
                    //console.log(body);
                    var json_body = parser.toJson(body);
                    var parsed_body = JSON.parse(json_body);
                    //console.log("The response from the url link is: " + json_body);

                    var items = parsed_body.rss.channel.item;
                    for (var item in items){
                        //console.log("An item obtained from the response is : " + item.toString());
                        //console.log("The title for item number " + item.toString() + " is " + items[item].title);
                        //console.log("The link for item number " + item.toString() + " is " + items[item].link);
                        var desc = '';
                        if (items[item].hasOwnProperty('description')){
                            desc = items[item].description.split("&lt;br")[0];
                            //console.log("The description for item number " + item.toString() + " is " + description[0]);
                        }
                        var article_title = items[item].title.replace(new RegExp("&apos;", "g"), "'");

                        //ToDo: search for similar article and only if not present, enter into the db.

                        Article.create({title: article_title, link: items[item].link, description: desc, SourceId: source.id}, function(err, data){
                            if (err){
                                console.log("There was an error creating the article.");
                                return console.error(err);
                            }
                            console.log("An article with the following title was generated: " + data.title);

                        });
                    }
                    cb(null, json_body);
                });
            });

        });
    };
    Article.remoteMethod(
            'pullFeed',
            {
                http: {path: '/pullfeed', verb: 'get'},
                accepts: [
                {arg: 'source_id', type: 'string', http: {source: 'query'}}
                ],
                returns: {arg: 'data', type: 'string'}
            });


    Article.pullAll = function(cb){
        /*
         * Pulling all feeds from all sources.
         */
        
        var Source = Article.app.models.Source;
        Source.find({}, function(err, sources){
            sources.forEach(function(source){
                //console.log(source.url);
                console.log("Pulling feed from the source: " + source.url);
                console.log("\n\n\n\n\n");
                Article.pullFeed(source.id, function(err, response){
                    if (err){
                        return console.error(err);
                    }
                    //console.log("Successfully pulled feeds with response: " + response);
                });
            });
            cb(null, true);
        });

    };
    Article.remoteMethod(
            'pullAll',
            {
                http: {path: '/pullAll', verb: 'get'},
                returns: {arg: 'data', type: 'string'}
            });
};
