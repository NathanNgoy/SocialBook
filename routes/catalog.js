var express = require('express');
var router = express.Router();

// Require controller modules.
var user_controller = require('../controllers/userController');
var post_controller = require('../controllers/postController');
var home_controller = require('../controllers/homeController');

            /// USER ROUTERS ///

router.get('/signup', user_controller.sign_up_get);

router.post('/signup', user_controller.sign_up_post);

router.get('/login', user_controller.login_get);

router.post('/login', user_controller.login_post)

router.get('/logout', user_controller.logout_get);

router.get('/users/:id', user_controller.get_profile);

                ///  HOME PAGE ///

// Get a list of all the posts for the homepage timeline
router.get('/home', home_controller.get_post_list);

// Create a status post
router.post('/posts', post_controller.post_create_post);

// Delete a post
router.post('/posts/:id/delete', post_controller.post_delete_post);

// Search for friend using first name
router.post('/search', home_controller.search_list);

// redirect to home page
router.get('/', home_controller.get_redirect);

// get list of friend
router.get('/users/:id/friends', home_controller.get_friend_list);


            /// PROFILE PAGE ///

// Send a friend request
router.post('/users/:id1/friendrequest/:id2', user_controller.friendrequest_post);

//id1 -> sender, id2 -> reciever
router.post('/users/:id1/friendrequest/:id2/accept', user_controller.friendrequest_accept);

// decline a friend request
router.post('/users/:id1/friendrequest/:id2/decline', user_controller.friendrequest_decline);

// get specific post to leave comment
router.get('/posts/:id', post_controller.get_post);

// create a new comment (id is post id)
router.post('/comments/:id', post_controller.post_create_comment);

// delete a comment 
router.post('/comments/:id/delete', post_controller.post_delete_comment);

            // find new friends page //

router.get('/findfriends', home_controller.get_user_list);

module.exports = router;