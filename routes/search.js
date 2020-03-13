const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Load Question Model
require('../models/Question');
const Question = mongoose.model('questions');
// Load User Model
require('../models/User');
const User = mongoose.model('users');



// Search for Questions
router.get('/questions', (req, res) => {
   const q = req.query['q'];
   if(q === 'undefined' || q == null || q == ""){
      res.status(400).json('Please specify a search string!');
   }

   Question.find( 
      // Find question with either title or body containing search string
      { $or: [ {title: {$regex: new RegExp(q)}}, {body: {$regex: new RegExp(q)}} ]},
      // Exclude some data from documents
      { __v: 0}
   )
   .populate('user answers.answerUser', '_id lastname firstname')
   .then(questions => {
      res.json(questions);
   });
});

// Search for Answers
router.get('/answers', (req, res) => {
   const q = req.query['q'];
   if(q === 'undefined' || q == null || q == ""){
      res.status(400).json('Please specify a search string!');
   }

   Question.aggregate([
      { $match: {'answers.answerBody': {$regex: new RegExp(q)}} },
      { $unwind: "$answers" },
      { $match: {'answers.answerBody': {$regex: new RegExp(q)}} },
      { $group: {
            _id: "$_id",
            answers: { $push: "$answers" },
      } },
   ])
   .then(questions => {
      res.json(questions);
   });
});

// Search for Users
router.get('/users', (req, res) => {
   const q = req.query['q'];
   if(q === 'undefined' || q == null || q == ""){
      res.status(400).json('Please specify a search string!');
   }

   User.find( 
      // Find user with either Firstname or Lastname containing search string
      { $or: [ {firstname: {$regex: new RegExp(q)}}, {lastname: {$regex: new RegExp(q)}} ]},
      // Exclude some data from documents
      { _id: 1, firstname: 1, lastname: 1 }
   )
   .then(user => {
      res.json(user);
   });
});

module.exports = router;