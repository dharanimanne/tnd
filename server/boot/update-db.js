module.exports = function(app) {
    /*
     * The `app` object provides access to a variety of LoopBack resources such as
     * models (e.g. `app.models.YourModelName`) or data sources (e.g.
     * `app.datasources.YourDataSource`). See
     * http://docs.strongloop.com/display/public/LB/Working+with+LoopBack+objects
     * for more info.
     */
    app.datasources.tnd.isActual(app.models, function(err, actual){
        if (!actual){
            app.datasources.tnd.autoupdate(app.models, function(err, result){
                if (err) throw err;

                console.log('All database models updated. The result returned is: ' + result.toString());
            });
        }
    });
};
