var User = require("../models/user")
const expressValidator = require("express-validator");
var async = require('async');
const bcrypt = require("bcryptjs");
const { insertMany } = require("../models/user");
const passport = require("passport");
const Post = require("../models/post");
const friendRequest = require("..//models/friendrequest");
const Comment = require("../models/comment")
var isFriend = false;
var pendingFriend = false;

exports.sign_up_get = function(req, res) {
    res.render("signup", { title: "Sign up"});
}

exports.sign_up_post = [

    expressValidator.body('first_name', 'First name must not be empty.').trim().isLength({ min: 1 }),
    expressValidator.body('last_name', 'Last name must not be empty.').trim().isLength({ min: 1 }),
    expressValidator.body('email', 'Email must not be empty.').trim().isLength({ min: 1 }),
    expressValidator.body('password', 'Password must not be empty and at least 5 characters long').trim().isLength({ min: 5 }),
    expressValidator.body('confirmPassword', 'passwordConfirmation field must have the same value as the password field')
    .exists()
    .custom((value, { req }) => value === req.body.password),

    // Sanitize fields (using wildcard).
    expressValidator.sanitizeBody('*').escape(),

    (req, res, next) => {
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if (err) {return next(err)}
            const errors = expressValidator.validationResult(req);

            const user = new User({
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                email: req.body.email,
                password: hashedPassword,
                bio: req.body.bio
            })
            if (!errors.isEmpty()) {
                res.render('signup', {errors: errors.array()});
                return;
            }
            else {
                user.save(function(err) {
                    if (err) { return next(err) }
                    req.login(user, function(err) {
                        if (err) { return next(err); }
                        return res.redirect('/home');
                    })
                })
            }
        })
    }
];

exports.login_get = function(req, res) {
    res.render("login", {title: "Login"});
}

exports.login_post = passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login"
})

exports.logout_get = function(req, res){
    req.logout();
    res.redirect("/login");
}

//Get user profile
exports.get_profile = function(req, res, next){
    async.parallel({
        user: function(callback){
            User.findById(req.params.id).exec(callback);
        },
        postsOfUser: function(callback){
            Post.find({ "author": req.params.id}).populate('author').sort({"date":-1}).exec(callback);
        },
        comment_list: function(callback){
            Comment.find({}).populate("author").sort({"date":-1}).exec(callback);
        },
        pending_friendRequest: function(callback){
            friendRequest.find({"status": "Pending"}).exec(callback);
        }
        
    }, function (err, results) {
        if(err) {
            return next(err);
        }
        
        isFriend = false;

        // refrence: req.user is the currentUser, results.user is the profile
        if(req.user){

            // Go through friend array to check if user is friend with this person
            results.user.friends.forEach((friend) => {
                if(friend.equals(req.user._id)){
                    isFriend = true;
                }
            });

            // Go through friendrequest array to check if there is a pending friend request between currentUser and user
            results.pending_friendRequest.forEach((pending) => {
                if (pending.from.equals(results.user._id) && pending.to.equals(req.user._id)) {
                    pendingFriend = true;
                } 
                if (pending.from.equals(req.user._id) && pending.to.equals(results.user._id)){
                    pendingFriend = true;
                }
            })
        }
        res.render("profile", { user: results.user, postsOfUser: results.postsOfUser, currentUser: req.user, isfriend: isFriend, pendingfriend: pendingFriend, comments: results.comment_list})
    })
}

//Create a friend request in DB
exports.friendrequest_post = function(req, res, next){
    console.log(req.body.urltoredirect);
    async.parallel({
        reciever: function(callback){
            User.findById(req.params.id1).exec(callback);
        },
        sender: function(callback){
            User.findById(req.params.id2).exec(callback);
        }
    }, function(err, results) {
        if(err) { return next(err); }

        const friendship = new friendRequest({
            from: results.sender,
            to: results.reciever
        }).save((err) => {
            if(err) return next(err);
        })
        return res.redirect(req.body.urltoredirect);
    })
    
}

//id1 - sender, id2 - reciever
//If accept, change status pending to status accept in DB
exports.friendrequest_accept = function(req, res, next){
    friendRequest.findOneAndUpdate({"status": "Pending", "from": req.params.id1, "to": req.params.id2}, {"status": "Accepted"}
    ).then((frreq) => {
        User.findByIdAndUpdate(req.params.id1, {$push: { friends: req.params.id2 }}).then((sender) => {
            User.findByIdAndUpdate(req.params.id2, {$push: { friends: req.params.id1 }}).then((reciever) => {
                res.status(200).json({ message: "Friends request accepted."});
            })
            .catch((err) => {
                next(err)
            });
        })
    })
    res.redirect("/users/" + req.params.id2 + "/friends")
}

//If reject, delete from DB
exports.friendrequest_decline = function(req, res, next){
    friendRequest.findOneAndDelete({"status": "Pending", "from": req.params.id1, "to": req.params.id2})
        .then((declinedReq) => {
            res.status(200).json({ message: "Friend request declined."})
        })
        .catch((err) => {
            next(err);
        })
    res.redirect("/users/" + req.params.id2 + "/friends")
}