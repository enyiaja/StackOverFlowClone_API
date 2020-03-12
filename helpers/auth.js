const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Load User Model
require('../models/User');
const User = mongoose.model('users');

// DB Config
const db = require('../config/database');

const getTokenFromHeaders = (req) => {
   const {headers : { authorization } } = req;

   if(authorization && authorization.split(' ')[0] === 'Token'){
      return authorization.split(' ')[1];
   }
   return null;
};

module.exports = {
   authenticateJWT: (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (authHeader) {
         const token = authHeader.split(' ')[1];

         jwt.verify(token, db.accessTokenSecret, (err, user) => {
            if (err) {
               return res.status(403).json({ message: 'Access to the specified feature is forbidden!' });
            }
            req.user = user;
            next();
         });
      } else {
         res.status(401).json( {message: 'User is not authorized to access this feature!'} );
      }
  }
}