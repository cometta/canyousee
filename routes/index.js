var util = require('../middleware/utilities'),
	config = require('../config'),
	user = require('../passport/user');


module.exports.index = index;
module.exports.login = login;
module.exports.logOut = logOut;
module.exports.play = play;
module.exports.about = about;
module.exports.admin = admin;
module.exports.leaderboard = leaderboard;
module.exports.register = register;
module.exports.registerProcess = registerProcess;
module.exports.playProcess = playProcess;
module.exports.adminProcess = adminProcess;


function index(req, res){
	res.render('index', {title: 'Index'});
};

function login(req, res){
	res.render('login', {title: 'Login', message: req.flash('error')});
};

function register(req, res){
	res.render('register', {title: 'Register', message: req.flash('error')});
};

function registerProcess(req, res){
	if (req.body.username && req.body.password)
	{
		user.addUser(req.body.username, req.body.password, config.crypto.workFactor, function(err, profile){
			if (err) {
				req.flash('error', err);
				res.redirect(config.routes.register);
			}else{
				req.login(profile, function(err){
					res.redirect(config.routes.play);
				});
			}
		});
	}else{
		req.flash('error', 'Please fill out all the fields');
		res.redirect(config.routes.register);
	}
};

function logOut(req, res){
	util.logOut(req);
	res.redirect('/');
};

function play(req, res){
	res.render('play', {title: 'Play now',link:genImageLink() });
};

function playProcess(req, res){
		console.log('anser='+req.body.ans+"  "+req.body.link);

		res.redirect(config.routes.play);
};



function about(req, res){
	res.render('about', {title: 'About Us'});
};

function leaderboard(req, res){
	res.render('leaderboard', {title: 'Leaderboard'});
};

function admin(req, res){
	res.render('admin', {title: 'Admin',link:genImageLink() });
};

function adminProcess(req, res){
	console.log('anser='+req.body.ans+"  "+req.body.link);

		res.redirect(config.routes.admin);
};




function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function genImageLink(){


var url1 = 'http://map1.vis.earthdata.nasa.gov/wmts-geo/MODIS_Terra_CorrectedReflectance_TrueColor/default/';
var url2 = '/EPSG4326_250m/';
var dateRand  =  randomDate(new Date("2015-01-20"), new Date("2015-01-25")).toISOString().substring(0,10);

var zoomL = 7;   //6     ;  8   ; 7
var tileRowMin = 10, tileRowMax = 70, tileRowRand=-1; //10->30  ; 20->130  ; 10->65
var tileColMin = 1, tileColMax = 150, tileColRand=-1; //1->60  ; 1-> 318 ;    1->150

tileRowRand = getRandomInt(tileRowMin, tileRowMax);
tileColRand = getRandomInt(tileColMin, tileColMax);

return (url1+dateRand+url2+zoomL+'/'+tileRowRand+'/'+tileColRand+'.jpg');




}
