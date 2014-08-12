var Yarn = require('./models/yarn.js');
var User = require('./models/user.js');
var Photo = require('./models/photo.js');

exports.createUser = function(req, callback) {
    new User({
        name: req.body.name,
        id: req.body.id,
        yarnIds: []
    }).save(function(err, user, numAffected) {
        callback(err, user);
    });
};

exports.findUser = function(req, callback) {
    User.findOne({ id: req.body.id }, function(err, user) {
        callback(err, user);
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

