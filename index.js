const express = require('express');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const Tokens = require('csrf');
require('dotenv').config();

const authRoutes = require("./route/auth");
const billingRoutes = require("./route/billing");
const rithmicRoutes =require("./route/rithmic")

const app = express();
const PORT = process.env.PORT || 5000;


// Setting up CORS
// app.use(cors({
//   origin: process.env.CLIENT_ORIGIN,
//   credentials: true,
// }));

app.use(cors());

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setting up cookie-parser
app.use(cookieParser());

// CSRF protection setup
const tokens = new Tokens();
const secret = process.env.CSRF_SECRET || tokens.secretSync(); 

// Middleware to get CSRF token
app.get('/csrf-token', (req, res) => {
  let csrfToken = req.cookies['csrfToken'];
  if (!csrfToken) {
    csrfToken = tokens.create(secret);
    res.cookie('csrfToken', csrfToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV, // Should be true in production
    });
  }
  res.json({ csrfToken });
});

// CSRF protection middleware
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const csrfToken = req.cookies['csrfToken']
  // console.log(req.cookies);
  if (!tokens.verify(secret, csrfToken)) {
    // console.log("verifying csrf")
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  next();
});

// Using routes defined in auth.js and billing.js
app.use('/api', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/rithmic',rithmicRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
