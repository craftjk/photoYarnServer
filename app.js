var express = require('express');
var mongoose = require('mongoose');
var api = require('./db/api.js');

// bodyParser on its own has been deprecated
// use bodyParser.urlencoded() or
// use bodyParser.json() as needed
var bodyParser = require('body-parser');
var mongoLabUrl = process.env.mongoLab || 'mongodb://localhost/photoYarn';

var app = express();

// takes data the client sends to server
// and sets them as keys on the body property
// on the request
app.use(bodyParser.urlencoded({
    extended: true
}));

// need this to server up html/css/js
app.use(express.static(__dirname + '/public'));

// api.removeAllYarns();
// api.removeAllPhotos();

console.log('===============================================================')

// connect to mongodb
mongoose.connect(mongoLabUrl);

// enable CORS
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.post('/users', function(req, res) {
    console.log('post to users', req.body)
    api.findUser(req, function(err, user) {
        if (err) {
            res.send({err: err, msg: 'error in finding user'});
        } else if (user) {
            // probably have to query db to find and
            // send all relevant user data at this point
            res.status(200).send({user: user, msg: 'user already exists'});
        } else {
            api.createUser(req, function(err, user, numAffected) {
                if (err) {
                    res.send({err: err, msg: 'error in creating new user'});
                } else {
                    res.status(200).send({user: user, msg: 'new user successfully created'});
                }
            });
        }
    });
});


// client will call as soon as app loads to
// load up a view of all the yarns

// TODO: put id param back in route later
app.get('/getAllYarns/:id', function(req, res) {

    api.getAllYarns(req, res);
    
});

// route for working on browser
app.get('/getYarnsBrowser/', function(req, res) {

    api.getYarnsBrowser(req, res);
    
});

// called when creating a new yarn
app.post('/createNewYarn', function(req, res) {

    api.createYarn(req, res);

});

// client will call this, providing a yarn id
// in order to add a photo to a specific yarn
app.post('/addToYarn', function(req, res) {

    // api.addPhoto(req, function(err, yarn, num) {
    //     if (err) {
    //         res.send(err);
    //     } else {
    //         res.status(200).send(yarn);
    //     }
    // });

    api.addPhoto(req, res);
    
});

app.get('*', function(req, res) {
    res.status(404).send('Page not found');
});

module.exports = app;
