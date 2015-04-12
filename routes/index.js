var util = require('../middleware/utilities'),
  config = require('../config'),
  user = require('../passport/user');

var models = require('../models');


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


function index(req, res) {


  res.render('index', {
    title: 'Index'
  });
}
;

function login(req, res) {
  res.render('login', {
    title: 'Login',
    message: req.flash('error')
  });
}
;

function register(req, res) {
  res.render('register', {
    title: 'Register',
    message: req.flash('error')
  });
}
;

function registerProcess(req, res) {
  if (req.body.username && req.body.password) {
    user.addUser(req.body.username, req.body.password, config.crypto.workFactor, function(err, profile) {
      if (err) {
        req.flash('error', err.message);
        res.redirect(config.routes.register);
      } else {
        req.login(profile, function(err) {
          res.redirect(config.routes.play);
        });
      }
    });
  } else {
    req.flash('error', 'Please fill out all the fields');
    res.redirect(config.routes.register);
  }
}
;

function logOut(req, res) {
  util.logOut(req);
  res.redirect('/');
}
;

function play(req, res) {

  models.User.userScoreReward(req.user.userId,req.user.userProvider, function(err,col){

    if(col.length >0){
        col.forEach(function(doc, index) {
          res.render('play', {
            title: 'Play now',
            link: genImageLink(),
            score: doc.score,
            reward: doc.reward
          });

        });
    }

  });



};

function ajaxPlay(req,callback){

  models.User.userScoreReward(req.user.userId,req.user.userProvider, function(err,col){

    if(col.length >0){
        col.forEach(function(doc, index) {

         callback({
            title: 'Play now',
            link: genImageLink(),
            score: doc.score,
            reward: doc.reward
          });


        });
    }

  });


}

function playProcess(req, res) {
  //console.log('anser='+req.body.ans+"  "+req.body.link);
  //console.log('>>>'+req.user.id+"  "+req.user.profileUrl +" photos="+req.user.photos+"  "+req.user.provider);

  var transObj = new models.TransactionObj({
    imageUrl: req.body.link,
    userId: req.user.userId,
    userProvider: req.user.userProvider,
    askQuestion: 'found-event',
    answerQuestion: req.body.ans,
    tranDate: new Date()


  });





  req.models.TransactionObj.create(transObj, function(error, transactionObjResponse) {
    if (error) return console.log(error);

    //add user score
    models.User.findOneAndUpdate(

      {
        'userId': req.user.userId,
        'userProvider': req.user.userProvider
      }

      ,

      {

        $inc: {
          'score': 1
        }

      }


      , {
        upsert: false
      }, function(error2) {
        if (error2) {
          console.error(String(error2));
        }


      });




    if (req.body.ans == 'yes')
      models.TransactionObjMaster.findOneAndUpdate(

        {
          'imageUrl': req.body.link,
          'processed': false
        }

        ,

        {
          $set: {
            'imageUrl': req.body.link,
            'askQuestion': 'found-event',
            'answerQuestion': req.body.ans,
            'tranDate': new Date()


          },
          $inc: {
            'counting': 1
          }

        }


        , {
          upsert: true
        }, function(error2) {
          if (error2) {
            console.error(String(error2));
          }



          ajaxPlay(req,function(playdata){
            res.send(playdata);
          });

          //res.redirect(config.routes.play);
        });

      else
        ajaxPlay(req,function(playdata){
            res.send(playdata);
        });

         //res.redirect(config.routes.play);



  });

}
;



function about(req, res) {
  res.render('about', {
    title: 'About Us'
  });
}
;

function leaderboard(req, res) {

  models.User.listtopplayers(function(err,result){

    res.render('leaderboard', {
      title: 'Leaderboard',
      result: result
    });

  });



}
;

function admin(req, res) {


  models.TransactionObjMaster.adminProcessImages(function(err,col){
        if(err) console.log(err);

        if(col.length >0){

            col.forEach(function(doc, index) {

                res.render('admin', {
                  title: 'Admin',
                  link: doc.imageUrl,
                  numberPlay: doc.counting
                });
            });
        }else{


            res.render('admin', {
              title: 'Admin',
              link: '',
              numberPlay: 0
            });
        }


  });



};




function ajaxadmin(req,callback){


  models.TransactionObjMaster.adminProcessImages(function(err,col){



        if(err) console.log(err);

        if(col.length >0){

            col.forEach(function(doc, index) {

                callback({
                  title: 'Admin',
                  link: doc.imageUrl,
                  numberPlay: doc.counting
                });


            });
        }else{


            callback({
              title: 'Admin',
              link: '',
              numberPlay: 0
            });
        }


      });


}



function adminProcess(req, res) {

  //decide right or wrong, then reward user
  //prevent user from exploit
   if(!req.user.admin)
   {
     res.send({error:true});

     return;
   }



  models.TransactionObjMaster.findOneAndUpdate(

    {
      'imageUrl': req.body.link,

    }

    ,

    {
      $set: {
        'tranDate': new Date(),
        'processed': true,
        'processedByUserId': req.user.userId,
        'processedByUserProvider': req.user.userProvider

      }

    }


    , {
      upsert: false
    }, function(error2) {
      if (error2) {
        console.error(String(error2));
      }

       //async loop each users that correct and get reward point
       if(req.body.ans == 'yes')
       models.TransactionObj.listImageIs(req.body.link, function(err,col){

         if(col.length >0){

             col.forEach(function(doc, index) {
              
               models.User.findOneAndUpdate(

                 {
                   'userId': doc.userId,
                   'userProvider': doc.userProvider
                 }

                 ,

                 {

                   $inc: {
                     'reward': 1
                   }

                 }


                 , {
                   upsert: false
                 }, function(error3) {
                   if (error3) {
                     console.error(String(error3));
                   }



                 });



             });
         }

       });

        //res.redirect(config.routes.admin);
        ajaxadmin(req,function(playdata){
                  res.send(playdata);
                  });

    });




}
;




function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function genImageLink() {

  var starDate = new Date();
  starDate.setDate(starDate.getDate() - 4);

  var endDate = new Date();
  endDate.setDate(endDate.getDate() - 2);

  var url1 = 'http://map1.vis.earthdata.nasa.gov/wmts-geo/MODIS_Terra_CorrectedReflectance_TrueColor/default/';
  var url2 = '/EPSG4326_250m/';
  var dateRand = randomDate(starDate, endDate).toISOString().substring(0, 10);

  var zoomL = 7; //6     ;  8   ; 7
  var tileRowMin = 10,
    tileRowMax = 70,
    tileRowRand = -1; //10->30  ; 20->130  ; 10->65
  var tileColMin = 1,
    tileColMax = 150,
    tileColRand = -1; //1->60  ; 1-> 318 ;    1->150

  tileRowRand = getRandomInt(tileRowMin, tileRowMax);
  tileColRand = getRandomInt(tileColMin, tileColMax);

  return (url1 + dateRand + url2 + zoomL + '/' + tileRowRand + '/' + tileColRand + '.jpg');




}
