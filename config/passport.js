// config/passport.js

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');

//Serialize & Desrialize User
//로그인시 DB에서 발견한 user를 어떻게 session에 저장할지 정하는 부분
passport.serializeUser(function(user, done){
    done(null, user.id);
});
//request시 session에서 어떻게 user object를 만들지 정하는 부분
passport.deserializeUser(function(id, done){
    User.findOne({_id:id}, function(err, user){
        done(err, user);
    });
});

//local strategy
passport.use('local-login',
    new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
        function(req, username, password, done){
            User.findOne({username:username})
                .select({password:1})
                .exec(function(err, user){
                    if(err) return done(err);

                    if(user && user.authenticate(password)){
                        return done(null, user);
                    }else{
                        req.flash('username', username);
                        req.flash('errors', {login:'The username or password is incorrect.'});
                        return done(null, false);
                    }
                })
        }
    )
);

module.exports = passport;