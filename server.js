const express = require('express');
var Mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const session = require('express-session');

// Okta authentication

// const { ExpressOIDC } = require('@okta/oidc-middleware');
//const oidc = new ExpressOIDC;
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/phantasyleague", { native_parser: true });
db.bind('events');

var udb = mongo.db("mongodb://localhost:27017/phantasyleague", { native_parser: true });
udb.bind('userpicks');

//const mongodb = require('mongodb');
//const mongojs = require('mongojs');
// const auth = require('okta');
const bodyParser = require('body-parser');
const logger = require("morgan");

const app = express();
const port =  process.env.PORT || 2000;



// Session support is required to use ExpressOIDC
// app.use(session({
//   secret: 'this should be secure',
//   resave: true,
//   saveUninitialized: false
// }));

// const oidc = new ExpressOIDC({
//   issuer: 'https://dev-655171.oktapreview.com/oauth2/default',
//   client_id: '0oadlub0ayviB7RVT0h7',
//   client_secret: '{authAsgard}',
//   // redirect_uri: 'http://localhost:3000/00QPQDBybMcgexzqyEd1jXyz40JoaCFOhKcnVpCPug/callback',
//   redirect_uri: 'https://dev-655171.okta.com/login/default',
//   scope: 'openid profile'
// });



// // ExpressOIDC will attach handlers for the /login and /authorization-code/callback routes
// app.use(oidc.router);



// Start Okta auth server
// oidc.on('ready', () => {
//   app.listen(80, () => console.log(`Started!`));
// });

// oidc.on('error', err => {
//   console.log('Unable to configure ExpressOIDC', err);
// });

// app.get('/protected', oidc.ensureAuthenticated(), (req, res) => {
//   res.send(JSON.stringify(req.userinfo));
// });



// oidc.on('ready', () => {
//   app.listen(3000, () => console.log(`Started!`));
// });

// oidc.on('error', err => {
//   console.log('Unable to configure ExpressOIDC', err);
// });

// Mongo Database Server
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Set the app up with morgan, body-parser, and a static folder
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static("public"));

// Database configuration for events
//const databaseUrl = "";
//const collections = ["events"];


// Hook mongojs config to db variable
//const db = mongojs(databaseUrl, collections);
// Log any mongojs errors to console
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

app.listen(port, (err) => {
  if (err) {
    return console.log('\nsomething bad happened', err)
  }

  console.log(`\nserver is listening on ${port}`)
});

// Root path
app.get("/", function (req, res) {
  res.send("Sup world");
});

// Route for displaying userpick form when Register button is clicked

// Route for retrieving and showing events in component route
app.get("/events", function (req, res) {
  getEvents()
    .then(function (events) {
      res.send(events);
    })
    .catch(function (err) {
      res.status(400).send(err);
    });
});

function getEvents() {
  var deferred = Q.defer();
  db.events.find().toArray(function (err, events) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    deferred.resolve(events);
  });
  return deferred.promise;
}
app.get("/event", function (req, res) {
  var id = req.query.id;
  getEventById(id)
    .then(function (events) {
      res.send(events);
    })
    .catch(function (err) {
      res.status(400).send(err);
    });
});

function getEventById(_id) {
  var deferred = Q.defer();

  db.events.findById(ObjectId(_id), function (err, event) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    if (event) {
      deferred.resolve(event);
    } else {
      // user not found
      deferred.resolve();
    }
  });

  return deferred.promise;
}

// app.post("/userpicks", function (req, res) {
//   var item = req.body;
  
//   console.log(item);
  
//   createUserPicks(item)
//     .then(function (events) {
//       res.send(events);
//     })
//     .catch(function (err) {
//       res.status(400).send(err);
//     });

// });

function createUserPicks(item) {
  
  var deferred = Q.defer();
  udb.userpicks.insert(
    item,
    function (err, doc) {
      if (err) deferred.reject(err.name + ': ' + err.message);
      deferred.resolve();
    });

  return deferred.promise;
}

createUserPicks();

//Route for Authentication and redirection
// server.get('/callback',
//   passport.authenticate('auth0', { failureRedirect: '/login' }),
//   function(req, res) {
//     if (!req.user) {
//       throw new Error('user null');
//     }
//     res.redirect("/");
//   }
// );

// server.get('/login',
//   passport.authenticate('auth0', {}), function (req, res) {
//   res.redirect("/");
// })

