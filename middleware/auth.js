function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next(); // User is authenticated, proceed to the next middleware or route handler
    }
    // Redirect to the login page if not authenticated
    res.redirect('/');
}

module.exports = { ensureAuthenticated };
