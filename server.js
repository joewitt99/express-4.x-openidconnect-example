var http = require("https");

var express = require('express');
var passport = require('passport');
var Strategy = require('@joewitt99/passport-openidconnect').Strategy;


// Configure the Twitter strategy for use by Passport.
//
// OAuth 1.0-based strategies require a `verify` function which receives the
// credentials (`token` and `tokenSecret`) for accessing the Twitter API on the
// user's behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    //clientID: process.env.CLIENT_ID,
    //clientSecret: process.env.CLIENT_SECRET,
    issuer: 'covisint.com',

    // STG
    //clientID: 'kLFFNtjtHPwiMtjgkFRnZSSHDRUNGG9H',
    //clientSecret: 'AnLx7ULwep93Nnh7',
    //authorizationURL: 'https://apistg.np.covapp.io/oauth/v3/authorization',
    //tokenURL: 'https://apistg.np.covapp.io/oauth/v3/token',
    //callbackURL: 'http://openidconnect-example.azurewebsites.net/callback',
    //userInfoURL: 'https://apistg.np.covapp.io/person/v3/userInfo'

    // QA
    clientID: 'AZ65UNn7MtHtzjnQIEJ9BDsICUSfcvHG',
    clientSecret: 'AcgwJ6ROKoG8McMM',
    authorizationURL: 'https://apiqa.np.covapp.io/oauth/v3/authorization',
    tokenURL: 'https://apiqa.np.covapp.io/oauth/v3/token',
    callbackURL: 'http://localhost:9999/callback',
    //callbackURL: 'http://openidconnect-example.azurewebsites.net/callback',
    userInfoURL: 'https://apiqa.np.covapp.io/person/v3/userInfo'
  },
  function(iss, sub, profile, accessToken, refreshToken, cb) {
    // In this example, the user's Twitter profile is supplied as the user
    // record.  In a production-quality application, the Twitter profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.

    //call the userInfo directly.  The library is not working as expect.
    /*var options = {
      "method": "GET",
      "hostname": "apistg.np.covapp.io",
      "port": 443,
      "path": "/person/v3/userInfo",
      "headers": {
        "authorization": "Bearer " + accessToken,
        "accept": "application/json",
        "cache-control": "no-cache"
      }
    };

    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
        profile.name.givenName = body.given_name;
        profile.name.familyName = body.family_name;
        return cb(null, profile);
        
      });
    });*/

    return cb(null, profile);
    
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/idp',
  passport.authenticate('openidconnect'));

app.get('/callback', 
  passport.authenticate('openidconnect', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  //require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.listen(process.env.port);
