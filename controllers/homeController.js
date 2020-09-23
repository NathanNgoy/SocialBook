var User = require("../models/user");
var Post = require("../models/post");
var Comment = require("../models/comment")
var friendRequest = require("../models/friendrequest");

const expressValidator = require("express-validator");
var async = require('async');

exports.get_redirect = function(req, res) {
    res.redirect('/home');
}

// Get a list of all the posts for the homepage timeline
exports.get_post_list = function(req, res) {
    async.parallel({
        post_count: function(callback){
            Post.find({}).populate("author").sort({"date":-1}).exec(callback);
        },
        comment_list: function(callback){
            Comment.find({}).populate("author").sort({"date":-1}).exec(callback);
        }
    }, function(err, results) {
        res.render('home', { error: err, all_posts: results.post_count, currentUser: req.user, comments: results.comment_list });
    });
}

// When user searches for someone in the searchbar
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

// Shows a list of friend requests and the users current friends
exports.get_friend_list = function(req, res){
    async.parallel({
        friend_request_list: function(callback){
            friendRequest.find({"status": "Pending", "to": req.params.id}).populate('from').exec(callback);
        },
        friend_lists: function(callback){
            friendRequest.find({"status": "Accepted", "to": req.params.id}).populate('from').exec(callback);
        }
    }, function(err, results) {
        res.render("friend", {
            currentUser: req.user, 
            error: err, 
            friend_requests: results.friend_request_list, 
            friend_list: results.friend_lists});
    })
}

// Shows a list of all users
exports.get_user_list = function(req, res){
    async.parallel({
        user_list: function(callback){
            User.find({}).populate('friends').exec(callback);
        }
    }, function(err, results) {
        console.log(results);
        
        res.render('new_friends', {error: err, users: results.user_list, currentUser: req.user})
    })
}