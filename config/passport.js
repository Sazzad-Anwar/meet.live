//jshint esversion:10

//This passport is for user authentication method. here the passport-local method will work for this.
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs'); // initializing password encription method

// Load User model
const db = require('./db');  //initializing the user model of database


// Here is the full authentication function and this will be exported.
module.exports = function(passport) {
  passport.use('local',
    new LocalStrategy({ usernameField: 'email', passwordField : 'password',passReqToCallback : true }, (req,email,password, done) => {
    db.db.query('SELECT * FROM vault WHERE email = ?',[email],(err,row)=>{
        if (err){
          return done(err);
        }
        else if (!row.length) {
            return done(null, false, req.flash('error_msg','Credentials do not match')); 
        }
        else if(row.length !== 0){
            bcrypt.compare(password,row[0].password,(err,isMatched)=>{
              if(err) throw err;
              if(isMatched){
                return done(null, row[0]);
              }else{
                return done(null, false, req.flash('error_msg','Login credentials do not match'));
              }
            });
        }
      });
}));
      // Match user
        
  passport.serializeUser(function(user, done) {
    
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    db.db.query("SELECT * FROM vault WHERE id = ? ",[id], function(err, rows){            
      done(err, rows[0]);
    });
  });
};
