const express = require('express');
const router = express.Router();
const UserControllers= require('../Controller/UserController');

// // router.post('/login', UserControllers.login );
// router.post('/signup',UserControllers.signup);
router.post('/register',UserControllers.postregister);
router.post('/login', UserControllers.userlogin);
// router.get('/auth/google',UserControllers.authgoogle);
// router.get('/google/callback',UserControllers.callback)
// router.get('/callback',UserControllers.callback);


router.get('/postreset/:token',UserControllers.getreset);
router.post('/postreset',UserControllers.postreset);

module.exports=router;