
var mongoose = require('mongoose');


var transactionObjSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  userId: { type: String, required: true },
  userProvider: { type: String, required: true },
  askQuestion: { type: String, required: true },
  answerQuestion: { type: String, required: true },
  tranDate:    { type: Date,   required: true }

});

//transactionObjSchema.static({
//  list: function(callback){
//    this.find({}, null, {sort: {_id:-1}}, callback);
//  }
//})









module.exports = mongoose.model('TransactionObj', transactionObjSchema);
