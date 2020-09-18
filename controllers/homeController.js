var User = require("../models/user");
var Post = require("../models/post");
var friendRequest = require("../models/friendrequest");

const expressValidator = require("express-validator");
var async = require('async');

exports.get_redirect = function(req, res) {
    res.redirect('/home');
}

exports.get_post_list = function(req, res) {
    async.parallel({
        post_count: function(callback){
            Post.find({}).populate("author").sort({"date":-1}).exec(callback);
        },
    }, function(err, results) {
        res.render('home', { error: err, all_posts: results.post_count, currentUser: req.user });
    });
}

exports.search_list = function(req, res){
    async.parallel({
        search_lists: function(callback){
            User.find({"firstName": req.body.searchContent}).exec(callback);
        }
    }, function(err, results) {
        console.log(results);

        res.render('search_list', {error: err, search_list: results.search_lists, currentUser: req.user})
    })
}

exports.get_friend_list = function(req, res){
    async.parallel({
        friend_request_list: function(callback){
            friendRequest.find({"status": "Pending", "to": req.params.id}).populate('from').exec(callback);
        },
        friend_lists: function(callback){
            friendRequest.find({"status": "Accepted", "to": req.params.id}).populate('from').exec(callback);
        }
    }, function(err, results) {
        console.log(results);
        res.render("friend", {
            currentUser: req.user, 
            error: err, 
            friend_requests: results.friend_request_list, 
            friend_list: results.friend_lists});
    })
}
