var LocalStrategy   = require('passport-local').Strategy;
var mysql = require('mysql');
var connection = require('./model/users');
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// expose this function to our app using module.exports
module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
    done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
    connection.query("select * from users where id = "+id,function(err,rows){ 
      done(err, rows[0]);
    });
    });
  
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
      connection.query("select * from users where email = '"+email+"'",function(err,rows){
      console.log(rows);
      console.log("above row object");
      if (err)
        return done(err);
      if (rows.length) {
        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
      } else {
        var newUserMysql = new Object();
        
        newUserMysql.email    = email;
        newUserMysql.password = password; // use the generateHash function in our user model
      
        var insertQuery = "INSERT INTO users ( email, password ) values ('" + email +"','"+ password +"')";
          console.log(insertQuery);
        connection.query(insertQuery,function(err,rows){
        newUserMysql.id = rows.insertId;
        
        return done(null, newUserMysql);
        }); 
      } 
    });
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
      console.log(email);
      connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'",function(err,rows){
      if (err)
        return done(err);
      if (!rows.length) {
        return done(null, false); // req.flash is the way to set flashdata using connect-flash
      } 
      
      if (!( rows[0].password == password))
                return done(null, false); // create the loginMessage and save it to session as flashdata
      
            // all is well, return successful user
            return done(null, rows[0]);     
    
    });
    }));

    passport.use('info', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : 'your_jwt_secret'
    },
    function (jwtPayload, cb) {

        //find the user in db if needed
      connection.query("select * from users where id = " + jwtPayload.id, function(err,rows){ 
        if (err) return cb(err);
        if (rows) return cb(null, rows[0]);
      })
    }));

    var GoogleStrategy = require('passport-google-oauth20').Strategy;

    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback"
      },
      function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
          return cb(err, user);
        });
      }
    ));
};