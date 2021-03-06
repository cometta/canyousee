var express = require('express'),
	partials = require('express-partials'),
	app = express(),
	routes = require('./routes'),
	errorHandlers = require('./middleware/errorhandlers'),
	log = require('./middleware/log'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	csrf = require('csurf'),
	session = require('express-session'),
	RedisStore = require('connect-redis')(session),
	util = require('./middleware/utilities'),
	flash = require('connect-flash'),
	config = require('./config'),
	passport = require('./passport');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
// get the app environment from Cloud Foundry
var	appEnv = cfenv.getAppEnv();
var bluemixRedis='';
//var bluemixMongoUrl;
if (process.env.VCAP_SERVICES) {

	var env = JSON.parse(process.env.VCAP_SERVICES);
  var credentials = env['redis-2.6'][0]['credentials'];

	bluemixRedis = 'redis://'+credentials.name+':'+credentials.password+'@'+credentials.host+':'+credentials.port;
	//bluemixMongoUrl = env['mongodb-2.4'][0]['credentials'].url;
}else{
	appEnv.port='';
}

var redisURL =  bluemixRedis || process.env.REDISCLOUD_URL || config.redisURL;
var serverPort = appEnv.port || process.env.PORT || config.port;

var mongoose = require('mongoose');
var dbUrl = process.env.MONGOSOUP_URL || 'mongodb://@localhost:27017/canyousee';
var db = mongoose.connect(dbUrl, {safe: true});
var models = require('./models');




app.set('view engine', 'ejs');
app.set('view options', {defaultLayout: 'layout'});

app.use(partials());
app.use(log.logger);
app.use(express.static(__dirname + '/static'));
app.use(cookieParser(config.secret));
app.use(session({
	secret: config.secret,
	saveUninitialized: true,
	resave: true,
	store: new RedisStore(
		{url: redisURL})
	})
);

app.use(function(req, res, next) {
  if (!models.TransactionObj) return next(new Error("No models."))
  req.models = models;
  return next();
});

app.use(passport.passport.initialize());
app.use(passport.passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(csrf());
app.use(util.csrf);
app.use(util.authenticated);
app.use(flash());
app.use(util.templateRoutes);
//routes
app.get('/', routes.index);
app.get(config.routes.login, routes.login);
app.get(config.routes.logout, routes.logOut);
app.get(config.routes.register, routes.register);
app.post(config.routes.register, routes.registerProcess);
app.get(config.routes.play, [util.requireAuthentication], routes.play);
app.post(config.routes.play, routes.playProcess);
app.get(config.routes.about, routes.about);
app.get(config.routes.leaderboard, routes.leaderboard);
app.get(config.routes.admin, [util.requireAuthentication], routes.admin);
app.post(config.routes.admin, routes.adminProcess);


app.get('/error', function(req, res, next){
	next(new Error('A contrived error'));
});
passport.routes(app);
app.use(errorHandlers.error);
app.use(errorHandlers.notFound);
console.log("server running on port"+serverPort);
var server =  app.listen(serverPort);
