const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// DB Config
const db = require('../config/database');

// Create Schema
const UserSchema = new Schema({
   lastname: {
      type: String,
      required: true
   },
   firstname: {
      type: String,
      required: true
   },
   email: {
      type: String,
      required: true
   },
   password: {
      type: String,
      required: true
   },
});

UserSchema.methods.generateJWT = function() {
   const today = new Date();
   const expirationDate = new Date(today);
   expirationDate.setDate(today.getDate() + 60);
 
   return jwt.sign({
     email: this.email,
     id: this._id,
     exp: parseInt(expirationDate.getTime() / 1000, 10),
   }, db.accessTokenSecret);
 }

UserSchema.methods.toAuthJSON = function(){
   return{
      _id: this._id,
      email: this.email,
      firstname: this.firstname,
      lastname: this.lastname,
      token: this.generateJWT(),
   }
}


UserSchema.index({ lastname: 'text', firstname: 'text' });

mongoose.set('useCreateIndex', true);
mongoose.model('users', UserSchema);