'use strict';

var express = require('express'),
    mongoose = require('mongoose'),
    Message = require('./models/message'),
    crypto = require('crypto'),
    bodyParser = require('body-parser'),
    app;

app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

mongoose.connect("mongodb://test1:123456@lighthouse.2.mongolayer.com:10332,lighthouse.3.mongolayer.com:10331/cms2-test3?replicaSet=set-557e0faef912aca27b000f4a");

app.get('/api/messages/:id', (req, res)=>{
    var location = sha256(req.params.id, req.query.canon);
    Message.find({location: location.locationHash}).sort({created: -1}).populate('replies').lean().exec((err, messages)=>{
        if(err){
            console.log(err);
            return res.status(503).send('error');
        }
        return res.send(messages);
    });
});

app.post('/api/messages/:id', (req, res)=>{
    var location = sha256(req.params.id, req.body.canon);
    var message = new Message({
        location: location.locationHash,
        text: req.body.text,
        username: req.body.name || 'Guest',
        created: new Date()
    });
    message.save((err, doc)=>{
        if(err){
            return res.status(503).send('error saving');
        }
        Message.find({location: location.locationHash}).sort({created: -1}).populate('replies').lean().exec((error, messages)=>{
            if(err){
                console.log(error);
                return res.status(503).send('error');
            }
            return res.send(messages);
        });
    });
});

app.post('/api/replies/:pageId/:message', (req, res)=>{
    var message = new Message({
        location: null,
        text: req.body.message,
        username: req.body.name || 'Guest',
        created: new Date()
    });
    message.save((err, reply)=>{
        if(err){
            return res.status(503).send('error saving');
        }
        Message.findOneById(req.params.message).exec((e, doc)=>{
            if(e){
                console.log(error);
                return res.status(503).send('error');
            }
            doc.replies.push(reply);
            doc.save((er)=>{
                Message.find({location: doc.location}).sort({created: -1}).populate('replies').lean().exec((error, messages)=>{
                    if(err){
                        console.log(error);
                        return res.status(503).send('error');
                    }
                    return res.send(messages);
                });
            });
        });

    });
});

app.get('/', (req, res)=>{
    res.send('hello world!');
});

var sha256 = function(id, salt){
    var hash = crypto.createHmac('sha256', salt); /** Hashing algorithm sha512 */
    hash.update(id);
    var value = hash.digest('hex');
    return {
        salt:salt,
        locationHash:value
    };
};

module.exports = app;