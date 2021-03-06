# My Application

The project is generated by [LoopBack](http://loopback.io).

Authentication:

Flow Overview:
1. The facebook authentication will be done on the client platform.
2. Upon successful auth, the client will send fb id and fb access token to the server.
3. The server/API will then set the access token and query fb graph API for any necessary information.
4. If the client is a mobile device, the access token is a long life one. If web token, convert it to long-lived one.

Note : The access token will not be saved on the client for any further purposes. However, facebook SDK saves it in Session.getCurrentAccessToken. This token will have 60 days of life approximately and is portable. If frequent requests are made to the facebook through their SDK, the access tokens keep refreshing once a day. This implies that if an access token is present in the db for a user, it will most probably be valid. However, in the very off chance, I would like to make a verification, just in case.

Types of Users:
1. There are 3 types of users.
2. New - This user is visiting the client for the first time and has to sign up using facebook.
3. Returning but signed out - This user is a returning customer and has to login.
4. Returning but already signed in - This user might be using multiple clients.

Technical Flow Overview:
1. C - check for any cookie and if present, send a request to server to check if facebook access token is present and still valid.
2. S - If validation request is received from client, do so and send back the status.
3. S - If token is present and still valid, then login user on server and send response to client accepting login on client side as well.
4. S - If token is invalid, remove the token from db and send response to client asking for login again on client side.
5. C - Login if server response says so. If no, redirect to facebook login here.
6. C - If no cookie is present, redirect user to facebook login screen.
7. S - After successful login, insert/update the fb access token of a user with the latest access token received.
8. S - After setting access token, check if the user profile is filled and get info from facebook graph API if it isn't.

Note : C - On Client, S - On Server. Login on client is always accompanied with a request to server if successful. This request will hold the fb id and fb access token obtained by the user through that client login. This request SHOULD be done through HTTPS only for security concerns.



Instructions to follow for hosting :
1. The current hosting is on DigitalOcean server, which is running ubuntu 14.04 LTS.
2. The server being used is nginx for reverse proxying and pm2 is the daemon running the loopback server. 
3. In case of any restarts, the pm2 daemon should be invoked and only then will the reverse proxying through nginx server will work.
