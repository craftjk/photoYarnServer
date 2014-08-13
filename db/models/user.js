var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    id: Number,
    yarnIds: [String],
    friendIds: [Number]
    
});

module.exports = mongoose.model('User', userSchema);
