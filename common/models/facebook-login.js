module.exports = function(FacebookLogin) {

    /* Login method through facebook
     *
     *
     */
    FacebookLogin.login = function(fb_id, fb_accesstoken, cb){
        FacebookLogin.findOne({where: {id: fb_id}}, function(err, data){
            // ToDo : Update the fb access token with the new one.
            var MyUser = FacebookLogin.app.models.MyUser;

            if (data){
                console.log("An existing user in the db is trying to login using facebook.");

                MyUser.login({email: data.fb_email, password: "dummyPassword"}, function(err, accessToken){
                    if (err){
                        return console.error(err);
                    }
                    console.log("Logging in existing user. \n");
                    console.log("The access token of the user is : " + accessToken);
                    cb(null, accessToken);
                });

            } else{
                console.log("A new user is trying to register using facebook.");

                var url = 'https://graph.facebook.com/me?fields=id,name,first_name,last_name,email,birthday,link,picture.width(800).height(800),gender&access_token='+fb_accesstoken;
                var http = require('http');
                var https = require('https');
                https.get(url, function(res){
                    var body = '';

                    res.on('data', function(chunk){
                        body += chunk;
                    });

                    res.on('end', function(){
                        var fb_response = JSON.parse(body);    
                        console.log("Got response from Facebook: " + fb_response);
                        console.log("Got facebook ID of user: " + fb_response.id);

                        if (fb_response.hasOwnProperty('error')){
                            var response = fb_response.error;
                            cb(null, response);
                        } else{

                            if (fb_response.id == fb_id){
                                MyUser.findOne({where: {email: fb_response.email}}, function(err, user){
                                    if (user){
                                        console.log("A user who is in db but hasn't logged in through fb is here. \n");

                                        MyUser.login({email: fb_response.email, password: "dummyPassword"}, function(err, accessToken){
                                            if (err){
                                                return console.error(err);
                                            }
                                            console.log("Logging in existing user. \n");
                                            console.log("The access token of the user is : " + accessToken);
                                            cb(null, accessToken);
                                        });
                                    } else{
                                        console.log("A new user is here to sign up. \n");

                                        MyUser.create({name: fb_response.name, first_name: fb_response.first_name, last_name: fb_response.last_name, email: fb_response.email, gender: fb_response.gender, birthday: fb_response.birthday, picture: fb_response.picture, password: "dummyPassword", created: Date()}, function(err, user){
                                            if (err){
                                                console.log("There was some error while trying to create a new user in db.");
                                                return console.error(err);
                                            }
                                            FacebookLogin.create({id: fb_id, fb_accesstoken: fb_accesstoken, fb_email: fb_response.email, MyUserId: user.id}, function(err, fb_login){
                                                if (err){
                                                    return console.error(err);
                                                }
                                                console.log("FacebookLogin created for new user: " + fb_login);
                                                MyUser.login({email: user.email, password: "dummyPassword"}, function(err, accessToken){
                                                    if (err){
                                                        return console.error(err);
                                                    }
                                                    console.log("Logging in existing user. \n");
                                                    console.log("The access token of the user is : " + accessToken);
                                                    cb(null, accessToken);
                                                });
                                            });
                                        });
                                    }
                                });
                            } else{
                                var response = "The fb id provided by client did not match that given by facebook";
                                console.log("The user is considered invalid due to mismatch of fb id on client and server side");
                                cb(null, response);
                            }
                        }
                    });

                }).on('error', function(e){
                    return console.error(e);
                });
            }
        });
    };
    FacebookLogin.remoteMethod(
        'login',
        {
            http: {path: '/login', verb: 'post'},
            accepts: [
                {arg: 'fb_id', type: 'string', http: {source : 'query'}},
                {arg: 'fb_accesstoken', type: 'string', http: {source: 'query'}}
            ],
            returns: {arg: 'data', type: 'string'}
        });
};
