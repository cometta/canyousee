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

var url = require('url');
var redisURL =  process.env.REDISCLOUD_URL ? url.parse(process.env.REDISCLOUD_URL) : config.redisUrl;
var herokuPORT = process.env.PORT || config.port;

var mongoose = require('mongoose');
var dbUrl = process.env.MONGOSOUP_URL || 'mongodb://@localhost:27017/canyousee';
var db = mongoose.connect(dbUrl, {safe: true});


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
app.get(config.routes.about, [util.requireAuthentication], routes.about);
app.get(config.routes.leaderboard, routes.leaderboard);
app.get(config.routes.admin, [util.requireAuthentication], routes.admin);


app.get('/error', function(req, res, next){
	next(new Error('A contrived error'));
});
passport.routes(app);
app.use(errorHandlers.error);
app.use(errorHandlers.notFound);

var server =  app.listen(herokuPORT);
