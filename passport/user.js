var passUtil = require('./password');
var models = require('../models');
var http = require('http');


var findByUsername = function findByUsername(username, cb){

	models.User.find({
		'username': username,
		'userProvider': 'local'
	}, function(err,col){

		if(col.length >0){

				col.forEach(function(doc, index) {
							return cb(null,doc);
				});
		}else{


				cb(null, null);
		}

	}).limit(1);




};

var addUser = function addUser(username, password, work, cb){



	models.User.find({
		'username': username,
		'userProvider': 'local'
	}, function(err,col){

		if(col.length ==0){



				passUtil.passwordCreate(password, function(err, salt, password){

					var newuserlocal = new models.User({
						salt: salt,
						password: password,
						work: work,
						displayName: username,
						userId: username,
						userProvider: 'local',
						username: username,
						creationDate: new Date(),
						tranDate : new Date()
					});

					newuserlocal.save(function (err) {
					if (err) // ...
						console.log(err);

						return cb(null, newuserlocal);

					});



				});


		}else{

			return cb({errorCode: 1, message: 'User exists!'}, null);


		}



	}).limit(1);




};

var updatePassword = function(username, password, work){
	passUtil.passwordCreate(password, function(err, salt, password){
		var updateuserlocal = new models.User({
			salt: salt,
			password: password,
			work: work,
			tranDate: new Date()
		});

		updateuserlocal.save(function (err) {
		if (err) // ...
			console.log('err');

		});
	});








};


var createUserIfNotExist = function(userId, provider, displayName,cb){


		models.User.find({
			'userId': userId,
			'userProvider': provider
		}, function(err,col){

			if(col.length ==0){

				var imageUrl='';
				if(provider == 'google'){

					getGooglePhoto(userId, function(imageUrl){
							this.imageUrl = imageUrl;

							addNewSocialUser(imageUrl,userId,provider,displayName);
							return cb(null,imageUrl);
					});

				}else if(provider =='facebook'){
					imageUrl = getFacebookPhoto(userId);
					addNewSocialUser(imageUrl,userId,provider,displayName);
					return cb(null,imageUrl);
				}





			}else{

				col.forEach(function(doc, index) {
						return cb(null,doc.thumbnailUrl);
				});



			}



		}).limit(1);







}

function addNewSocialUser(imageUrl,userId,provider,displayName){

	var user = new models.User({
		thumbnailUrl : imageUrl,
		userId: userId,
		userProvider: provider,
		creationDate:  new Date(),
		tranDate: new Date(),
		score: 0,
		reward: 0,
		displayName: displayName

	});
	user.save(function (err) {
	if (err) // ...
		console.log('err');
});


}


function getFacebookPhoto(facebookid){

		return "//graph.facebook.com/" + facebookid + "/picture?type=small";
}

function getGooglePhoto(googleid,cb){


	 http.get({
	        host: 'picasaweb.google.com',
	        path: '/data/entry/api/user/'+googleid+'?alt=json'
	    }, function(response) {
	        // Continuously update stream with data
	        var body = '';
	        response.on('data', function(d) {
	            body += d;
	        });
	        response.on('end', function() {

	            // Data reception is done, do whatever with it!
	            var parsed = JSON.parse(body);
	         		var imageUrl = parsed.entry.gphoto$thumbnail.$t;

							return cb(imageUrl.replace('http:','').replace('https:',''));
	        });




	    }).on('error', function (e) {
    			console.log(e);
					return cb(null);
			});
}


exports.findByUsername = findByUsername;
exports.addUser = addUser;
exports.updatePassword = updatePassword;
exports.createUserIfNotExist = createUserIfNotExist;
