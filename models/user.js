
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  thumbnailUrl : { type: String, default:'' },
  userId: { type: String, required: true },
  userProvider: { type: String, required: true },
  creationDate:    { type: Date,   required: true },
  tranDate:    { type: Date,   required: true },
  score:  { type: Number, default:0 },
  reward:  { type: Number, default:0 },
  //for manual login
  salt: { type: String },
  password: { type: String },
  work: { type: Number },
  displayName: { type: String},
  username: { type: String }

});






userSchema.static({
  listtopplayers: function(callback){
    this.find({}, null, {sort: { reward:1,score:1 }}, callback).limit(20);
  },
  userScoreReward: function(userId,userProvider, callback){
    this.find({ userId: userId, userProvider: userProvider}, null , {sort: { reward:1,score:1 }}, callback).limit(1);
  },



})



module.exports = mongoose.model('User', userSchema);
