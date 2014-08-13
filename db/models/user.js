var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    id: Number,
    yarnIds: [String],
    friends: [{
        id: Number,
        name: String
    }]
    
});

module.exports = mongoose.model('User', userSchema);
