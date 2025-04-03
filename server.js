const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const mongodb = require('./data/database');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;

const app = express();
const PORT = process.env.PORT || 3001;

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
    saveUninitialized: true
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
        res.send(`
            <h1>Logged in as ${req.session.user.displayName}</h1>
            <a href="/logout">Logout</a>
        `);
    } else {
        res.send(`
            <h1>Logged Out!</h1>
            <a href="/login">Login with GitHub</a>
        `);
    }
});

// GitHub OAuth Callback
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        req.session.user = req.user;
        res.redirect('/');
    }
);

// Middleware to Protect Routes
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized access. Please log in.' });
}

// Example Protected Routes
app.post('/data', ensureAuthenticated, (req, res) => {
    res.json({ message: 'POST request successful', data: req.body });
});

app.put('/data', ensureAuthenticated, (req, res) => {
    res.json({ message: 'PUT request successful', data: req.body });
});

app.delete('/data', ensureAuthenticated, (req, res) => {
    res.json({ message: 'DELETE request successful' });
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