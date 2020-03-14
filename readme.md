# StackOverflow Clone API
## Description
This project is a simple clone of StackOverflow; an online developer community for knowledge sharing.
It was developed as a coding test for Softcom Ltd using Node JS and MongoDB.

## Functional Requirements
- User signup 
- User sign in (using JWT) 
- Ask Question 
- View Questions 
- Upvote or downvote question 
- Answer Question 
- Search (Questions, Answers and Users) 
### Bonus
- User subscribe to Question (Get notification when question is answered)

## Thought Process
- **User sign up** was accomplished by getting form data from the request body and saving to the database after some checks. Two password fields are required for confirmation, and they must carry the same password and not be less than 7 characters. Password is then encrypted using bcryptjs and saved to the db along with other fields (lastname, firstname and email).
- **User sign in** was accomplished using a Passportjs local strategy to authenticate the email and password. After authentication, a jsonwebtoken is generated and returned along with a few of the logged in user's details.
- To **ask a question**, the user must be logged in. The route authenticates the jwt token to get the user's id and saves it to the Question collection along with the form data from the request body.
- Two routes were created for **viewing questions**. One requires the question id as a parameter and returns details of the specific question using findOne(). The other does not require any parameter and returns details on all questions using find().
- When a user **upvotes/downvotes a question**, there is a check to see if the user has upvoted or downvoted the question previously. If the user tries to upvote a question the user has upvoted previously, a message is returned informing the user that the user has performed the action before. If the user tries to upvote a question the user has downvoted before, the downvote is deleted and then the upvote is added. The same applies to downvoting.
- When a user **answers a question**, the answer and the user's id are posted (using array.unshift()) to the answers subdocument in the questions document. After this, notifications are sent to every user subscribed to the question.
- The **Search** feature has 3 routes for questions, answers and users respectively. Question search uses $or and $regex as params in Find, to get all occurences of the search text in the question title or body. Answers are saved as subdocuments in each question, so answer search uses aggregate ($match, $unwind and $group) to find all answers containing the search text and returns them with the id of the question. User search uses $or and $regex as params in Find, to get all occurences of the search text in user lastname or firstname.

## Routes
- POST /api/users/signin
- POST /api/users/signup
- GET /api/users/current
- GET /api/questions/
- GET /api/questions/view/[question_id]
- POST /api/questions/
- POST /api/questions/answer/[question_id]
- GET /api/questions/upvote/[question_id]
- GET /api/questions/downvote/[question_id]
- GET /api/questions/subscribe/[question_id]
- GET /api/search/questions?q=[search_text]
- GET /api/search/answers?q=[search_text]
- GET /api/search/users?q=[search_text]"