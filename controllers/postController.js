var Post = require("../models/post");
var Comment = require('../models/comment');
const expressValidator = require("express-validator");
var async = require('async');

exports.home = function(req,res){
    res.render("home", {title: "home", currentUser: req.user})
}

// POST create post
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

// GET edit post
exports.get_post_edit = function(req, res, next) {
    async.parallel({
        post_profile: function(callback){
            Post.findById(req.params.id).populate("author").exec(callback);
        },
        comment_list: function(callback){
            Comment.find({"postID": req.params.id}).populate("author").sort({"date":-1}).exec(callback);
        }
    }, function(err, results) {
        console.log(results.post_profile);
        res.render('post_edit', {error: err, post: results.post_profile, comments: results.comment_list, currentUser: req.user})
    })
}

// POST edit post
exports.post_post_edit = [
    expressValidator.body('postContent', 'content must not be empty.').trim().isLength({ min: 1 }),

    // Sanitize fields (using wildcard).
    expressValidator.sanitizeBody('*').escape(),

    (req, res, next) => {
        const errors = expressValidator.validationResult(req);

        const post = new Post({
            content: req.body.postContent,
            author: req.user,
            likes: 0,
            date: new Date(),
            _id: req.params.id
            })
        if (!errors.isEmpty()) {
            res.redirect("/posts/" + req.params.id + "/edit", {err: "Error inputting status"})
        }
        else {
            Post.findByIdAndUpdate(req.params.id, post, {}, function(err, update_post) {
                if (err) { return next(err); }
                res.redirect(update_post.url);
            })
        }
    }
]

//Page just for a post
exports.get_post = function(req, res, next){
    async.parallel({
        post_profile: function(callback){
            Post.findById(req.params.id).populate("author").exec(callback);
        },
        comment_list: function(callback){
            Comment.find({"postID": req.params.id}).populate("author").sort({"date":-1}).exec(callback);
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
        Comment.deleteMany({"postID": req.params.id}).then(
            Post.findByIdAndRemove(req.params.id, function deleteMessage(err) {
                if (err) { return next(err); }
                res.redirect("/home");
            }))
    })
}

// POST like
exports.add_like = function (req, res, next){
    Post.findByIdAndUpdate(req.body.postID, {$inc: {likes: 1}}, (err, doc) => {
        if(err) return next(err);
        if(!doc) return res.sendStatus(404);
        res.redirect(req.body.urltoredirect);
    })
}

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

// POST delete comment
exports.post_delete_comment = function (req, res, next) {
    console.log(req.params.id);
    Comment.findById(req.params.id).exec(function(err, message) {
        if (err) { return next(err); }
        Comment.findByIdAndRemove(req.params.id, function deleteComment(err){
            if (err) { return next(err); }
            res.redirect('/home');
        })
    })
}