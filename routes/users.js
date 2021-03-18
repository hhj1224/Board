// routes/users.js

var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');

//New
router.get('/new', function(req, res){
    var user = req.flash('user')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('users/new', {user:user, errors:errors});
});

//Create
router.post('/', function(req, res){
    User.create(req.body, function(err, user){
        if(err) {
            req.flash('user', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/users/new');
        }
        res.redirect('/users');
    });
});

//Show
router.get('/:username', util.isLoggedin, checkPermission, function(req, res){
    User.findOne({username:req.params.username}, function(err, user){
        if(err) return res.json(err);
        res.render('users/show', {user:user});
    });
});

//Edit
router.get('/:username/edit', util.isLoggedin, checkPermission, function(req, res){
    var user = req.flash('user')[0];
    var errors = req.flash('errors')[0] || {};
    if(!user){
        User.findOne({username:req.params.username}, function(err, user){
            if(err) return res.json(err);
            res.render('users/edit', {username:req.params.username, user:user, errors:errors});
        });
    }else{
        res.render('users/edit', {username:req.params.username, user:user, errors:errors});
    }
    
});

//Update
router.put('/:username', util.isLoggedin, checkPermission, function(req, res, next){
    User.findOne({username:req.params.username})
    .select('password')
    .exec(function(err, user){
        if(err) return res.json(err);

        //Update user object
        user.originalPassword = user.password;
        user.password = req.body.newPassword? req.body.newPassword : user.password;
        for(var p in req.body){
          user[p] = req.body[p];
        }
  
        // save updated user
        user.save(function(err, user){
            if(err) {
                req.flash('user', req.body);
                req.flash('errors', util.parseError(err));
                return res.redirect('/users/'+req.params.username+'/edit');
            }
            res.redirect('/users/'+user.username);
        });
    });
});

module.exports = router;

//functions
function parseError(errors){
    var parsed = {};
    if(errors.name == 'ValidationError'){
        for(var name in errors.errors){
            var validationError = errors.errors[name];
            parsed[name] = { message:validationError.message };
        }
    }else if(errors.code == '11000' && errors.errmsg.indexOf('username')>0){
        parsed.username = { message:'This username already exists!' }
    }else{
        parsed.unhandled = JSON.stringify(errors);
    }
    return parsed;
}

//private functions
function checkPermission(req, res, next){
  Post.findOne({_id:req.params.id}, function(err, post){
    if(err) return res.json(err);
    if(post.author != req.user.id) return util.noPermission(req, res);

    next();
  });
}