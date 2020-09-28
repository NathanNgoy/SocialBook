var User = require("../models/user");
var Post = require("../models/post");
var Comment = require("../models/comment")
var friendRequest = require("../models/friendrequest");
var Message = require("../models/message");

const expressValidator = require("express-validator");
var async = require('async');

exports.message_tbd = (req, res, next) => {
    res.render('message_tbd');
}

exports.message_list = (req, res, next) => {
    async.parallel({
        user: function(callback){
            User.find({}).exec(callback);
        },
    }, function(err, results) {
        res.render('messsage_list',{error:err, currentUser: req.user, user_list: results.user})
    })
}

exports.get_message = (req, res, next) => {
    async.parallel({
        all_messages: function(callback){
            Message.find({}).exec(callback);
        }
    }, function(err, results) {
        res.render('messages', { error: err, currentUser: req.user, messages: results.all_messages });
    });
   //res.render("messages", {title: "title"});
}

exports.post_message = [
    // Sanitize fields (using wildcard).
    expressValidator.sanitizeBody('*').escape(),

    (req, res, next) => {
        const errors = expressValidator.validationResult(req);

        const message = new Message({
            author: req.body.name,
            content: req.body.message
        })
        
        if (!errors.isEmpty()) {
            res.redirect("/messages", {err: "Error inputting status"})
        }
        else {
            console.log("saving message");
            message.save((err)=> {
                if (err) res.sendStatus(500);
                res.sendStatus(200);
            })
        }
    }
]