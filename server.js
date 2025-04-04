const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const mongodb = require('./data/database');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const { ObjectId } = require('mongodb'); // Import ObjectId for MongoDB operations

// const Joi = require('joi'); // Add Joi for validation

const app = express();
const PORT = process.env.PORT || 3000;

// Apply CORS Headers Globally
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

app.use(bodyParser.json());

// Swagger UI Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Session Configuration
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false, // Ensure session is not saved unless modified
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
    function (accessToken, refreshToken, profile, done) {
        // Log the profile object for debugging
        console.log('GitHub Profile:', profile);

        // Ensure displayName is set, fallback to username or other properties
        profile.displayName = profile.displayName || profile.username || profile.id;
        return done(null, profile);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Root Route
app.get('/', (req, res) => {
    if (req.session.user) {
        // Display a message indicating the user is logged in
        res.send(`
            <h1>Welcome, ${req.session.user.displayName}!</h1>
            <p>You are now logged in. You can use the POST, PUT, and DELETE API endpoints.</p>
            <a href="/logout">Logout</a>
        `);
    } else {
        res.send(`
            <h1>Logged Out!</h1>
            <a href="/login">Login with GitHub</a>
        `);
    }
});

// GitHub Login Route
app.get('/login', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub OAuth Callback
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        req.session.user = req.user; // Store user in session
        req.session.save((err) => { // Explicitly save session
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Failed to save session.' });
            }
            console.log('Session saved successfully:', req.session); // Debugging log
            res.redirect('/');
        });
    }
);

// Middleware to Protect Routes
function ensureAuthenticated(req, res, next) {
    console.log('Session before route:', req.session); // Debugging log for session
    console.log('User before route:', req.session.user); // Debugging log for user

    if (req.session && req.session.user) { // Ensure session and user exist
        return next();
    }
    res.status(401).json({ error: 'Unauthorized access. Please log in.' });
}

// Debugging Middleware for Request Body
app.use((req, res, next) => {
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request Headers:', req.headers); // Log headers to check for session cookie
    console.log('Request Body:', req.body);
    next();
});

// Fix CORS Preflight Requests for PUT and DELETE
app.options('/data', (req, res) => {
    res.sendStatus(204);
});

// Custom Validation Function
function validateData(data) {
    if (!data.field1 || typeof data.field1 !== 'string') {
        return 'field1 is required and must be a string.';
    }
    if (!data.field2 || typeof data.field2 !== 'number') {
        return 'field2 is required and must be a number.';
    }
    if (data.field3 !== undefined && typeof data.field3 !== 'boolean') {
        return 'field3 must be a boolean if provided.';
    }
    return null;
}

// Example Protected Routes with Custom Validation and Error Handling
app.post('/data', ensureAuthenticated, async (req, res) => {
    try {
        console.log('POST /data called by user:', req.session.user); // Debugging log
        const validationError = validateData(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        const db = mongodb.getDb().db('project1'); // Use the 'project1' database
        const result = await db.collection('items').insertOne(req.body); // Use the 'items' collection
        console.log('Session after POST:', req.session); // Debugging log for session
        res.status(201).json({ message: 'POST request successful', data: result });
    } catch (err) {
        console.error('POST Error:', err);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

app.put('/data', ensureAuthenticated, async (req, res) => {
    try {
        console.log('PUT /data called by user:', req.session.user); // Debugging log
        const validationError = validateData(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        if (!req.body._id) {
            return res.status(400).json({ error: '_id is required for PUT operation.' });
        }
        const db = mongodb.getDb().db('project1'); // Use the 'project1' database
        const result = await db.collection('items').updateOne(
            { _id: new ObjectId(req.body._id) },
            { $set: req.body }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'No document found with the provided _id.' });
        }
        res.status(200).json({ message: 'PUT request successful', data: result });
    } catch (err) {
        console.error('PUT Error:', err);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

app.delete('/items/:id', ensureAuthenticated, async (req, res) => {
    try {
        console.log('DELETE /items/:id called by user:', req.session.user); // Debugging log
        const id = req.params.id; // Extract _id from URL parameter
        if (!id) {
            return res.status(400).json({ error: '_id is required for DELETE operation.' });
        }
        const db = mongodb.getDb().db('project1'); // Use the 'project1' database
        const result = await db.collection('items').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'No document found with the provided _id.' });
        }
        res.status(200).json({ message: 'DELETE request successful', data: result });
    } catch (err) {
        console.error('DELETE Error:', err);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// Require Routes
app.use('/', require('./routes'));

// Error Handling for Undefined Routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'An internal server error occurred.' });
});

// Initialize MongoDB Connection and Start Server
mongodb.initDb((err) => {
    if (err) {
        console.log(err);
    } else {
        app.listen(PORT, () => {
            console.log(`Database is listening and Node.js server is running on port ${PORT}`);
        });
    }
});