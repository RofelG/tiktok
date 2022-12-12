'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

// Import Express
var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

//Connect Database
// const con = require('./config/mysql');

//Port Declaration
const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

//Require Middleware
const auth = require('./middleware/auth');

// Setup Cookie Parser
app.use(cookieParser());

// Allow json data to be passed in the body of requests
app.use(express.json());

// Serve static files in a virtual directory called static
app.use('/static', express.static('public'));

// API Routes - Public Routes (No Auth Required) - Register Route
app.post('/api/register', async (req, res) => {
  try {
    // Get user input
    const { user_first, user_last, user_email, user_password } = req.body;

    // Validate user input
    if (!(user_email && user_password && user_first && user_last)) {
      res.status(400).json({error:"All input is required"});
    }

    // Validate if user exist in our database
    let oldUser = await con.getUser(user_email);

    // If user does not exist, return error
    if (oldUser != undefined) {
      return res.status(409).json({error:"User Already Exist. Please Login"});
    }

    // Create Salt for password
    let salt = crypto.randomBytes(32).toString('hex');

    //Encrypt user password with salt
    let encryptedPassword = await bcrypt.hash(salt + user_password, 10);

    // Create user in our database with encrypted password
    let user = await con.createUser([user_first, user_last, user_email, encryptedPassword, salt]);

    // Create JWT Token for user authentication and authorization purposes (JWT Token is signed with user email) 
    const token = jwt.sign(
      { user_id: user, user_email },
        process.env.TOKEN_KEY,
      {
        expiresIn: "15m",
      }
    );

    // Create output object to return to user with token and user information
    let output = {
      user_id: user,
      user_first: user_first,
      user_last: user_last,
      user_email: user_email,
      token: token
    };

    // Return output object to user with status code 201 (Created) and token in cookie header
    res.status(201).json(output);
  } catch (err) {
    console.log(err);
  }
});

// API Routes - Public Routes (No Auth Required) - Login Route
app.post("/api/login", async (req, res) => {
  try {
    // Get user input
    const { user_email, user_password } = req.body;

    // Validate user input
    if (!(user_email && user_password)) {
      res.status(400).json({error:"All input is required"});
      return;
    }

    // Validate if user exist in our database 
    let cookie = req.header('Cookie');

    let loginCount = 0;
    if (cookie) {
      cookie = cookie.split('; ');

      for (let i = 0; i < cookie.length; i++) {
        if (cookie[i].includes('login=')) {
          let temp = cookie[i].split('=');
          loginCount = temp[1];
        }
      }
    }

    // If login count is greater than 5, return error
    if (loginCount >= 5) {
      res.status(400).json({error:"Too many login attempts. Please try again later."});
      return;
    }

    // Get user from database
    let user = await con.getUser(user_email);

    // If user exists, create token and return to user with status code 200 (OK) and token in cookie header 
    if (user && (await bcrypt.compare(user.user_salt + user_password, user.user_password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user.user_id, user_email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "15m",
        }
      );

      // Create output object to return to user with token and user information
      let output = {
        user_id: user.user_id,
        user_first: user.user_first,
        user_last: user.user_last,
        user_email: user.user_email,
        token: token
      };

      // Return output object to user with status code 200 (OK) and token in cookie header
      res.cookie('token', token, {
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true 
      }).status(200).json(output);
    } else {
      loginCount++;

      // Return error to user with status code 400 (Bad Request)
      res.cookie('login', loginCount, {
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true
      }).status(400).json({error:"Invalid Credentials"});
    }
  } catch (err) {
    console.log(err);
  }
});

// API Routes - Login Required Routes (Auth Required) - Users Route
app.post('/api/users/names', auth, async(req, res) => {
  try {
    // Get User Names from Database and return to user with status code 200 (OK)
    let output = await con.postUserNames(req.body);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
});

// API Routes - Login Required Routes (Auth Required) - Change Password Route
app.post('/api/user/changepassword', auth, async(req, res) => {
  try {
    // Get user input
    const { password_current, password_change, password_confirm } = req.body;

    // Validate user input
    if (!(password_current && password_change && password_confirm)) {
      res.status(400).json({error: "All input is required"});
      return;
    }

    // Validate if password change and password confirm match
    if (password_change !== password_confirm) {
      res.status(400).json({error: "Passwords do not match"});
      return;
    }

    // Get user from database
    let user = await con.getUser(req.user.user_email);

    // If user exists but password is incorrect, return error
    if (user && !(await bcrypt.compare(password_current + user.user_salt, user.user_password))) {
      res.status(400).send('Incorrect Password');
      return;
    }

    // Encrypt password and salt
    let salt = crypto.randomBytes(32).toString('hex');
    let encryptedPassword = await bcrypt.hash(salt + password_change, 10);

    let output = await con.changePassword([encryptedPassword, salt, req.user.user_id]);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
});

// API Routes - Public Routes (No Auth Required) - Logout Route
app.post('/api/user/logout', auth, async(req, res) => {
  try {
    // Clear cookie and return to user with status code 200 (OK)
    res.clearCookie('token').status(200).json({ status: true });
  } catch (err) {
    console.log(err);
  }
});

// Render Pages - Public Routes (No Auth Required) - Index Route
app.get('/', auth, function(req, res) {
  // Render index page
  res.render('pages/index');
});

app.listen(port, () => {
  // Log server is listening
  console.log('Server is listening http://localhost:' + port);
});