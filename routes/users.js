const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const { authenticateJWT } = require('../helpers/auth');

// Load User Model
require('../models/User');
const User = mongoose.model('users');


// Sign in Form POST
router.post('/signin', (req, res, next) => {
   
   return passport.authenticate('local', {session: false}, (err, passportUser, info) => {
      if(err){
         return next(err);
      }
      if(passportUser){
         const user = passportUser;
         user.token = passportUser.generateJWT();

         return res.json({ user: user.toAuthJSON() });
      }

      return res.status(401).json({ message: 'Login failed!'});
   })(req, res, next);
});

// Sign up Form POST
router.post('/signup', (req, res) => {
   let errors = [];

   if(req.body.lastname == null || req.body.lastname == ''){
      errors.push({text: 'Last Name is required!'});
   }
   if(req.body.firstname == null || req.body.firstname == ''){
      errors.push({text: 'First Name is required!'});
   }
   if(req.body.email == null || req.body.email == ''){
      errors.push({text: 'Email Address is required!'});
   }
   if(req.body.password == null || req.body.password == ''){
      errors.push({text: 'Password field is required!'});
   }
   if(req.body.password2 == null || req.body.password2 == ''){
      errors.push({text: 'Password confirmation field is required!'});
   }
   if(req.body.password != req.body.password2){
      errors.push({text: 'Passwords do not match'});
   }
   if(!(req.body.password == null || req.body.password == '' || req.body.password === 'undefined')){
      if(req.body.password.length < 6){
         errors.push({text: 'Password must be at least 6 characters'});
      }
   }
   

   if(errors.length > 0){
      res.status(500).json(errors);
      
   } else {
      User.findOne({email: req.body.email})
         .then(user => {
            if(user){
               errors.push({text: 'This Email address has already been used to create an account!'});
               res.status(500).json(errors);

            }else{
               const newUser = new User({
                  lastname: req.body.lastname,
                  firstname: req.body.firstname,
                  email: req.body.email,
                  password: req.body.password
               });
         
               bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(newUser.password, salt, (err, hash) =>{
                     if(err) throw err;
                     newUser.password = hash;
                     newUser.save()
                        .then(user => {
                           res.json({ message : 'You are now resgistered and can log in' });
                        })
                        .catch(err => {
                           console.log(err);
                           return;
                        })
                  });
               });
            }
         });
   }
});

// Logout User
router.get('/logout', authenticateJWT, (req, res) => {
   req.logout();
   res.json({'message':'User has been logged out'});

});

// Current User
router.get('/current', authenticateJWT, (req, res, next) => {
   const { payload: {id}} = req;

   return User.findById(id)
      .then((user) => {
         if(!user){
            return res.sendStatus(400);
         }
         return res.json({ 'id': id, user: user.toAuthJSON() });
      })
});

module.exports = router;