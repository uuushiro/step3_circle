var mongoose = require('mongoose');
var User = require('../models/user.js');

var CircleSchema = mongoose.Schema({
  circlename: {
    type: String,
    index: true
  },
  introduction: {
    type: String
  },
  member: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

var Circle = module.exports = mongoose.model('Circle', CircleSchema);

module.exports.createCircle = function(newCircle,callback){
  newCircle.save(function(err) {
  if (err) { console.log(err); }
});
}
