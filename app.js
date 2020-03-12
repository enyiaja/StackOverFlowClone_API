const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
// const cors = require('cors');
// const path = require('path');
// const methodOverride = require('method-override');


const app = express();

// Load Routes
const questions = require('./routes/questions');
const users = require('./routes/users');
const search = require('./routes/search');

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/database');

// Connect to Mongoose
mongoose.connect(db.mongoURI, {
   //useMongoClient: true
   useNewUrlParser: true,
   useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// CORS Middleware
// app.use(cors());

// BodyParser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder
// app.use(express.static(path.join(__dirname, 'public')));

// Method Override Middleware
// app.use(methodOverride('_method'));

// Express Session Middleware
app.use(session({
   secret: 'secret',
   resave: true,
   saveUninitialized: true
   //cookie: { secure: true }
}));

// Passport Middleware (Always below express session middleware)
app.use(passport.initialize());
app.use(passport.session());


app.get('/api', (req, res) => {
   res.json({
      message: 'Welcome to the API!'
   });
});

// Use routes
app.use('/api/questions', questions);
app.use('/api/users', users);
app.use('/api/search', search);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('Server started on port: ' + port ));