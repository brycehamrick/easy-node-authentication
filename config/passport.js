// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;

module.exports = function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(req, id, done) {
    req.models.user.get(id, function(err, user) {
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
  },
  function(req, email, password, done) {
    if (email)
      email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

    // asynchronous
    process.nextTick(function() {
      req.models.user.one({ email :  email }, function(err, user) {
        // if there are any errors, return the error
        if (err)
          return done(err);

        // if no user is found, return the message
        if (!user)
          return done(null, false, req.flash('loginMessage', 'No user found.'));

        if (!user.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

        // all is well, return user
        else
          return done(null, user);
      });
    });

  }));

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
  },
  function(req, email, password, done) {
    if (email)
      email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

    // asynchronous
    process.nextTick(function() {
      // if the user is not already logged in:
      if (!req.user) {
        req.models.user.one({ email :  email }, function(err, user) {
          // if there are any errors, return the error
          if (err)
            return done(err);

          // check to see if theres already a user with that email
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          } else {

            // create the user
            var newUser            = {};

            newUser.email    = email;
            newUser.password = req.models.user.generateHash(password);

            req.models.user.create(newUser, function(err) {
              if (err)
                return done(err);

              return done(null, newUser);
            });
          }

        });
      // if the user is logged in but has no local account...
      } else {
        // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
        return done(null, req.user);
      }

    });

  }));
};
