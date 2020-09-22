var Post = require("../models/post");
var Comment = require('../models/comment');
const expressValidator = require("express-validator");
var async = require('async');

exports.home = function(req,res){
    res.render("home", {title: "home", currentUser: req.user})
}

// POST create
exports.post_create_post = [
    expressValidator.body('postContent', 'content must not be empty.').trim().isLength({ min: 1 }),

    // Sanitize fields (using wildcard).
    expressValidator.sanitizeBody('*').escape(),

    (req, res, next) => {
        const errors = expressValidator.validationResult(req);

        const post = new Post({
            content: req.body.postContent,
            author: req.user,
            likes: 0,
            date: new Date()
            })
        if (!errors.isEmpty()) {
            res.render('home', {errors: errors.array()});
            return;
        }
        else {
            post.save(function(err) {
                if (err) { return next(err) }
                res.redirect('/home');
            })
        }
    }
];

//Page just for a post
exports.get_post = function(req, res, next){
    async.parallel({
        post_profile: function(callback){
            Post.findById(req.params.id).populate("author").exec(callback);
        },
        comment_list: function(callback){
            Comment.find({"postID": req.params.id}).populate("author").exec(callback);
        }
    }, function(err, results) {
        console.log(results.post_profile);
        res.render('post', {error: err, post: results.post_profile, comments: results.comment_list, currentUser: req.user})
    })
}


// POST delete
exports.post_delete_post = function (req, res, next){
    Post.findById(req.params.id).exec(function(err, message) {
        if (err) { return next(err); }
        Post.findByIdAndRemove(req.params.id, function deleteMessage(err) {
            if (err) { return next(err); }
            res.redirect("/home");
        })
    })
}

// POST like

// POST comment create
exports.post_create_comment = [
    expressValidator.body('commentContent', 'content must not be empty.').trim().isLength({ min: 1 }),

    // Sanitize fields (using wildcard).
    expressValidator.sanitizeBody('*').escape(),

    (req, res, next) => {
        const errors = expressValidator.validationResult(req);

        const comment = new Comment({
            content: req.body.commentContent,
            author: req.user,
            likes: 0,
            postID: req.params.id,
            date: new Date() 
            })

        if (!errors.isEmpty()) {
            res.render('home', {errors: errors.array()});
            return;
        }
        else {
            comment.save(function(err) {
                if (err) { return next(err) }
                res.redirect('/posts/'+req.params.id);
            })
        }
    }
];