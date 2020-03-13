const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Load Question Model
require('../models/Question');
const Question = mongoose.model('questions');
// Load User Model
require('../models/User');
const User = mongoose.model('users');

// Import auth (for requiring authentication) from helpers
const { authenticateJWT } = require('../helpers/auth');


// Function to delete a users downvote
const deleteDownvoter = (questionId, userId) => {
   Question.updateMany(
      { _id: questionId },
      { $pull: { downvoters: { downvoterUser: userId } } }
   )
   .then(question => {
      question.save();
   })
}

// Function to delete a users upvote
const deleteUpvoter = (questionId, userId) => {
   Question.updateMany(
      { _id: questionId },
      { $pull: { upvoters: { upvoterUser: userId } } }
   )
   .then(question => {
      question.save();
   })
}

// Function to notify a user for a subscribed question
const notifyUser = (questionTitle, userId) => {

   User.findById(userId)
   .then(user => {
      const newNotification = {
         notificationBody: "The question, \"" + questionTitle + "\" has been answered",
      }

      user.notifications.unshift(newNotification);
      user.save();
   })
}

// View Questions
router.get('/', (req, res) => {
   Question.find()
   .populate('user answers.answerUser', '_id lastname firstname')
   .then(questions => {
      res.json(questions);
   });
});

// View single question
router.get('/view/:id', (req, res) => {
   Question.findOne(
      { _id: req.params.id },
      { subscribers: 0, __v: 0 }
   )
   .populate('user answers.answerUser', '_id lastname firstname')
   .then(question => {
      res.json(question);
   });
 });

// Ask Question
router.post('/', authenticateJWT, (req, res) => {
   const { id } = req.user;
   
   const newQuestion = {
      title: req.body.title,
      body: req.body.body,
      user: id,
   }
 
   // Save Question
   new Question(newQuestion)
   .save()
   .then(question => {
      console.log(question);
      res.json({ message : 'Question has been asked successfully!'});
   });
});

// Answer a question
router.post('/answer/:id', authenticateJWT, (req, res) => {
   // First, find question with id in url
   Question.findOne({
      _id: req.params.id
   })
   .then(question => {
      const newAnswer = {
         answerBody: req.body.answerBody,
         answerUser: req.user.id
      }
      // Add to answer array
      question.answers.unshift(newAnswer);
      // Save changes to question
      question.save()
      .then(question => {
         question.subscribers.map(function(obj){
            notifyUser(question.title, obj.subscriberUser);
         });
         return res.json('Answer posted successfully');
      });
   })
   .catch(err => {
      res.sendStatus(404);
   })
});

// Upvote Question
router.get('/upvote/:id', authenticateJWT, (req, res) => {
   const { id } = req.user;
   // First, find question with id in url
   Question.findOne({
      _id: req.params.id
   })
   .then(question => {
      // Putting upvoter user ids in an array
      var arrayOfUpvoterIds = question.upvoters.map(function(obj) {
         return obj.upvoterUser;
      });
      // Putting downvoter user ids in an array
      var arrayOfDownvoterIds = question.downvoters.map(function(obj) {
         return obj.downvoterUser;
      });
      // Checking if logged in user is in upvoter array
      if(arrayOfUpvoterIds.includes(id)){ // User has upvoted this question previously
         res.status(403).json('You have upvoted this question previously!');
      }
      else{
         if(arrayOfDownvoterIds.includes(id)){ // User has downvoted this question previously
            deleteDownvoter(question._id, id);
         }
         // Add user to upvoters array
         question.upvoters.unshift({ upvoterUser: id });
         // Save changes to question
         question.save()
         .then(question => {
            return res.json('Question upvoted successfully');
         });
      }
   })
   .catch(err => {
      res.status(500).json({ message: err.message });
   })
});

// Downvote Question
router.get('/downvote/:id', authenticateJWT, (req, res) => {
   const { id } = req.user;
   // First, find question with id in url
   Question.findOne({
      _id: req.params.id
   })
   .then(question => {
      // Putting downvoter user ids in an array
      var arrayOfDownvoterIds = question.downvoters.map(function(obj) {
         return obj.downvoterUser;
      });
      // Putting upvoter user ids in an array
      var arrayOfUpvoterIds = question.upvoters.map(function(obj) {
         return obj.upvoterUser;
      });
      // Checking if logged in user is in downvoter array
      if(arrayOfDownvoterIds.includes(id)){ // User has downvoted this question previously
         res.status(403).json('You have downvoted this question previously!');
      }
      else{
         if(arrayOfUpvoterIds.includes(id)){ // User has upvoted this question previously
            deleteUpvoter(question._id, id);
         }
         // Add user to downvoters array
         question.downvoters.unshift({ downvoterUser: id });
         // Save changes to question
         question.save()
         .then(question => {
            return res.json('Question downvoted successfully');
         });
      }
   })
   .catch(err => {
      res.status(500).json({ message: err.message });
   })
});

// Subscribe to Question
router.get('/subscribe/:id', authenticateJWT, (req, res) => {
   const { id } = req.user;
   // First, find question with id in url
   Question.findOne({
      _id: req.params.id
   })
   .then(question => {
      // Putting subscriber user ids in an array
      var arrayOfSubscriberIds = question.subscribers.map(function(obj) {
         return obj.subscriberUser;
      });
      // Checking if logged in user is in subscriber array
      if(arrayOfSubscriberIds.includes(id)){ // User has subscribed to this question previously
         res.status(403).json('You are already subscribed to this question!');
      }
      else{
         // Add user to subscriber array
         question.subscribers.unshift({ subscriberUser: id });
         // Save changes to question
         question.save()
         .then(question => {
            return res.json('You have successfully subscribed to this question and will be notified when it is answered!');
         });
      }
   })
   .catch(err => {
      res.status(500).json({ message: err.message });
   })
});

module.exports = router;