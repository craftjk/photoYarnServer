var Yarn = require('./models/yarn.js');
var User = require('./models/user.js');
var Photo = require('./models/photo.js');
var request = require('request');

var createUser = function(req, res) {
    new User({
        name: req.body.name,
        id: req.body.id,
        yarnIds: []
    }).save(function(err, user, numAffected) {
        if (err) {
            res.send({err: err, msg: 'error in creating new user'});
        } else {
            // make request to fb to get list of user's friends
            var fbFriendsUrl = "https://graph.facebook.com/me/friends?access_token=" + req.body.token;

            request({
                method: "GET",
                uri: fbFriendsUrl
            }, function(error, response, body) {
                if (error) {
                    res.send({err: error, msg: 'err in accessing users friends'})
                } else {
                    var friendInfo = JSON.parse(body).data;
                    console.log(friendInfo)
                    exports.addFriends(res, user, friendInfo);
                }
            });
        }
    });
};

exports.loginUser = function(req, res) {
    User.findOne({ id: req.body.id }, function(err, user) {
        if (err) {
            res.send({err: err, msg: 'error in finding user'});
        } else if (user) {
            // probably have to query db to find and
            // send all relevant user data at this point
            res.status(200).send({user: user, msg: 'user already exists'});
        } else {
            createUser(req, res);
        }
    });
};

exports.addFriends = function(res, user, friends) {
    for (var i = 0; i < friends.length; i++) {
        user.friends.push(friends[i]);
    }
    user.save(function(err, user, numAffected) {
        if (err) {
            res.send({err: err, msg: 'error in adding friends'})
        } else {
            res.status(200).send({user: user, msg: 'new user successfully created with friends'});
        }
    });
};

exports.createYarn = function(req, res) {

    new Yarn({
        caption: req.body.caption,
        creatorId: req.body.creatorId,
        links: [req.body.link],
        lastUpdated: Date.now()
    }).save(function(err, yarn, numAffected) {
        if (err) {
            res.send({err: err, msg: 'error in creating new yarn'});
        } else {
            User.findOne({ id: req.body.creatorId }, function(err, user) {
                if (err) {
                    res.send({err: err, msg: 'error in finding user'});
                } else {
                    user.yarnIds.push(yarn._id);
                    user.save(function(err, user, num) {
                        if (err) {
                            res.send({err: err, msg: 'error in updating user'});
                        } else {
                            res.status(200).send({user: user, msg: 'yarn successfully created, user updated'})
                        }
                    });
                }
            });
        }
    });

};

exports.addPhoto = function(req, res) {

    Yarn.findOne({_id: req.body.yarnId}, function(err, yarn) {
        if (err) {
            res.send({err: err, msg: 'error in finding yarn'});
        } else {
            yarn.links.push(req.body.link);
            yarn.lastUpdated = Date.now();
            yarn.save(function(err, yarn, num) {
                User.findOne({ id: req.body.creatorId }, function(err, user) {
                    if (err) {
                        res.send({err: err, msg: 'error in finding yarn'});
                    } else {
                        if (user.yarnIds.indexOf(yarn._id) === -1) {
                            user.yarnIds.push(yarn._id);
                        }
                        user.save(function(err, user, num) {
                            if (err) {
                                res.send({err: err, msg: 'error in updating user'});
                            } else {
                                res.status(200).send('photo successfully added and user updated')
                            }
                        });
                    }
                });
            });
        }
    });
};


exports.getAllYarns = function(req, res) {
    User.findOne({ id: req.params.id }, function(err, user) {

        if (err) {
            res.send({err: err, msg: 'user not found'});
        } else {
            return Yarn.find({ _id: { $in: user.yarnIds } })
                    .sort('-lastUpdated')
                    .exec(function(err, yarns) {
                        if (err) {
                            res.send({err: err, msg: 'yarns could not be found'});
                        } else {
                            res.send(yarns);
                        }
                    });
        }
    });

};

exports.getYarnsBrowser = function(req, res) {
    return Yarn.find({})
            .sort('-lastUpdated')
            .exec(function(err, yarns) {
                if (err) {
                    res.send({err: err, msg: 'yarns could not be found'});
                } else {
                    res.send(yarns);
                }
            });
}

exports.removeAllPhotos = function() {
    Photo.remove({}, function(err) {
        console.log(err);
    });
};

exports.removeAllYarns = function() {
    Yarn.remove({}, function(err) {
        console.log(err);
    });
};

