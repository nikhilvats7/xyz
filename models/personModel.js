var mongoose = require('mongoose');
var personSchema = new mongoose.Schema({
    name: {
        first: String,
        last: String
    }
  });
  // compile our model
  var Person = mongoose.model('persons', personSchema);
  module.exports = Person;