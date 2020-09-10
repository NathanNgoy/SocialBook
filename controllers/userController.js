var User = require("../models/user")
const expressValidator = require("express-validator");
var async = require('async');
const bcrypt = require("bcryptjs");
const { insertMany } = require("../models/user");
const passport = require("passport");

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
    res.render("login", {title: "login"});
}

exports.login_post = passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login"
})

exports.logout_get = function(req, res){
    req.logout();
    res.redirect("/home");
}


