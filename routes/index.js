const express = require('express');
const passport = require('passport');
const router = express.Router();

router.use('/', require('./swagger'));

router.get('/', (req, res) => {
    if (req.session.user) {
        res.send(`
            <h1>Logged in as ${req.session.user.displayName}</h1>
            <a href="/logout">Logout</a>
        `);
    } else {
        res.send(`
            <h1>Welcome to the Login Page</h1>
            <a href="/login">Login with GitHub</a>
        `);
    }
});

router.get('/login', (req, res) => {
    res.redirect('/auth/github'); // Redirect to GitHub authentication
});

// Add GitHub authentication route
router.get('/auth/github', passport.authenticate('github'));

// Add GitHub callback route
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        req.session.user = req.user;
        res.redirect('/');
    }
);

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out.' });
        }
        res.redirect('/');
    });
});

router.use('/items', require('./items'));
router.use('/outofstock', require('./outofstock'));

module.exports = router;