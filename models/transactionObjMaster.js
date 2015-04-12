var mongoose = require('mongoose');

var transactionObjMasterSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  askQuestion: { type: String, required: true },
  answerQuestion: { type: String, required: true },
  tranDate:    { type: Date,   required: true },
  counting:  { type: Number,required: true, default:1 },
  processed:  { type: Boolean , default:false},
  processedByUserId :{ type: String},
  processedByUserProvider: { type: String }
});



transactionObjMasterSchema.static({
  adminProcessImages: function(callback){
    this.find({processed :false}, null, {sort: { counting:-1}}, callback).limit(1);
  }


})



module.exports = mongoose.model('TransactionObjMaster', transactionObjMasterSchema);
