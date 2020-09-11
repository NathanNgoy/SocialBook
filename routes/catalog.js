var express = require('express');
var router = express.Router();

// Require controller modules.
var user_controller = require('../controllers/userController');
var post_controller = require('../controllers/postController');
var home_controller = require('../controllers/homeController');

/// BLOG ROUTERS ///

//router.get('/', blog_controller.index);

//router.get('/home', blog_controller.list_blog);

//router.get('/message/create', blog_controller.message_create_get);

//router.post('/message/create', blog_controller.messsage_create_post);

//router.post('/message/:id/delete', blog_controller.message_delete_post);

/// USER ROUTERS ///

router.get('/signup', user_controller.sign_up_get);

router.post('/signup', user_controller.sign_up_post);

router.get('/login', user_controller.login_get);

router.post('/login', user_controller.login_post)

router.get('/logout', user_controller.logout_get);

router.get('/users/:id', user_controller.get_profile);

// home page //

router.post('/posts', post_controller.post_create_post);

router.post('/search', home_controller.search_list);

router.get('/home', home_controller.get_post_list);



module.exports = router;