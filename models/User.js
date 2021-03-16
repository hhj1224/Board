// models/User.js

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//schema
var userSchema = mongoose.Schema({
    username:{
        type:String, 
        required:[true, 'Username is required!'], 
        match:[/^.{4,12}$/, 'Should be 4-12 characters!'],
        trim:true,
        unique:true
    },
    password:{
        type:String, 
        required:[true, 'Password is required!'], 
        select:false
    },
    name:{
        type:String, 
        required:[true, 'Name is required!'],
        match:[/^.{4,12}$/, 'Should be 4-12 characters!'],
        trim:true
    },
    email:{
        type:String,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%-]+\.[a-zA-Z]{2,}$/,'Should ba a valid email address!'],
        trim:true
    }
},{
    toObject:{virtuals:true}
});

//virtuals(DB에 저장할 필요는 없지만 model에서 사용하고 싶은 항목들)
userSchema.virtual('passwordConfirmation')
    .get(function(){return this._passwordConfirmation})
    .set(function(value){this._passwordConfirmation=value;});

userSchema.virtual('originalPassword')
    .get(function(){return this._originalPassword})
    .set(function(value){this._originalPassword=value;});

userSchema.virtual('currentPassword')
    .get(function(){return this._currentPassword})
    .set(function(value){this._currentPassword=value;});

userSchema.virtual('newPassword')
    .get(function(){return this._newPassword})
    .set(function(value){this._newPassword=value;});

//password validation(패스워드 유효값 확인)
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/; //8-16자리 문자열 중에 숫자랑 영문자가 반드시 하나 이상 존재해야 한다
var passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!';
userSchema.path('password').validate(function(v){
    var user = this; //this = model

    //create user(회원가입)
    if(user.isNew){
        if(!user.passwordConfirmation){
            user.invalidate('passwordConfirmation', 'Password confirmation is required.');
        }

        if(!passwordRegex.test(user.password)){
            user.invalidate('password', passwordRegexErrorMessage);
        }else if(user.password !== user.passwordConfirmation){
            user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
    }

    //update user(회원정보수정)
    if(!user.isNew){
        if(!user.currentPassword){
            user.invalidate('currentPassword', 'Current Password is required!');
        }else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){ // bcrypt 의 compareSync함수를 사용해서 저장된 hash와 입력받은 password의 hash가 일치하는지 확인
            user.invalidate('currentPassword', 'Current Password is invalid!');
        }

        if(user.newPassword && !passwordRegex.test(user.newPassword)){
            user.invalidate('newPassword', passwordRegexErrorMessage);
        }else if(user.newPassword !== user.passwordConfirmation){
            user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
    }
});

//hash password
userSchema.pre('save', function(next){
    var user = this;
    if(!user.isModified('password')){
        return next();
    }else{
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
});

//model method
userSchema.methods.authenticate = function(password){
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

//model & export
var User = mongoose.model('user', userSchema);
module.exports = User;