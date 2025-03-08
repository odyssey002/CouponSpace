const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const pug = require('pug');
const bcrypt = require('bcrypt');
const port = 8000;
const mongoose = require('mongoose');
const exp = require('constants');
const User = require('./signup');
const Contact = require('./detailsdb');
const session = require('express-session');



// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/couponSpace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


// EXPRESS SPECIFIC CONFIGURATION
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use('/static', express.static('static')); // For serving static files
app.use(bodyParser.urlencoded({ extended: true }));


// PUG SPECIFIC CONFIGURATION
app.set('view engine', 'pug'); // Set the template engine as pug
app.set('views', path.join(__dirname, 'views')); // Set the views directory



// ENDPOINTS CONFIGURATION
app.get('/index', async (req, res) => {
  try {
    const data = await Contact.find({}).exec();
    res.render('index', { data });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/contact', (req, res) => {
  const params = {};
  res.status(200).render('contact', params);
});

app.get('/login', (req, res) => {
  const params = {};
  res.status(200).render('login', params);
});

app.get('/', (req, res) => {
  const params = {};
  res.status(200).render('register', params);
});


// Route for registering a user
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      var params = { alert: 'User already exists' };
      return res.status(409).render('register', params);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();
    // Redirect the user back to login page with success message
    // var params = { alert: 'User registered successfully!' };
    return res.status(200).redirect('/index');
  } catch (error) {
    // console.error('Error registering user:', error);
    var params = { alert: 'Internal server error' };
    return res.status(500).render('register', params);
  }
});


// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user in the database based on the email
    const user = await User.findOne({ email });

    // If the user is not found, return an error
    if (!user) {
      var params = { alert: 'User not found' };
      return res.status(404).send('login', params);
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If the passwords do not match, return an error
    if (!isPasswordValid) {
      var params = { alert: 'Invalid password' };
      return res.status(401).render('login', params);
    }

    // Password is valid, so the user is authenticated
    // we can create a session or generate a token for authentication here
    // For simplicity, we'll just return a success message
    return res.status(200).redirect('/index');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
});

// Route for logout
app.get('/logout', (req, res) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error clearing session:', err);
    }
    // Redirect the user to the login page
    res.redirect('/login');
  });
});


// Route for adding the contact details
app.post('/contact', (req, res) => {
  var params = { alert: 'Success, details have been submitted successfully...' };
  var myData = new Contact(req.body);
  myData
    .save()
    .then(() => {
      res.status(200).render('contact', params);
    })
    .catch((error) => {
      params = { alert: 'Something went wrong, please try again...' };
      res.status(400).render('contact', params);
    });
});

app.get('/api/data', (req, res) => {
  Contact.find({})
    .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

// app.get('/index', async (req, res) => {
//   try {
//     const data = await Contact.find({}).exec();
//     res.render('index', { data });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
//   }
// });


// START THE SERVER
app.listen(port, () => {
  console.log(`The application started successfully on port ${port}`);
});
