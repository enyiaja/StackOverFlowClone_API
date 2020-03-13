const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Shema
const QuestionSchema = new Schema({
   title:{
      type:String,
      required: true,
   },
   body:{
      type: String,
      required: true,
   },
   user:{
      type: Schema.Types.ObjectId,
      ref: 'users',
   },
   date:{
      type: Date,
      default: Date.now,
   },
   answers: [{
      answerBody: {
         type: String,
         required: true,
      },
      answerDate:{
         type: Date,
         default: Date.now,
      },
      answerUser:{
         type: Schema.Types.ObjectId,
         ref: 'users',
      }
   }],
   upvoters: [{
      upvoterUser: {
         type: Schema.Types.ObjectId,
         ref: 'users',
      },
      upvoteDate: {
         type: Date,
         default: Date.now,
      }
   }],
   downvoters: [{
      downvoterUser: {
         type: Schema.Types.ObjectId,
         ref: 'users',
      },
      downvoteDate: {
         type: Date,
         default: Date.now,
      }
   }],
   subscribers: [{
      subscriberUser: {
         type: Schema.Types.ObjectId,
         ref: 'users',
      },
      subscribeDate: {
         type: Date,
         default: Date.now,
      }
   }],
});
QuestionSchema.index({ title: 'text', body: 'text', 'answers.answerBody': 'text' });

mongoose.set('useCreateIndex', true);
// Create collection and add schema
mongoose.model('questions', QuestionSchema);