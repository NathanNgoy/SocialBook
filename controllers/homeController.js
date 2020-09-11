var User = require("../models/user");
var Post = require("../models/post");
const expressValidator = require("express-validator");
var async = require('async');

exports.get_post_list = function(req, res) {
    async.parallel({
        post_count: function(callback){
            Post.find({}, callback).populate("author");
        }
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
        res.render('search_list', {error: err, friend_list: results.search_lists})
    })
}
