var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    id: Number,
    yarnIds: [String],
    friends: [{type: String}]
});

module.exports = mongoose.model('User', userSchema);
