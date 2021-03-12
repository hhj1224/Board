// index.js

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var app = express();

//DB Setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb+srv://test_username:test_pass@cluster0.vpxmf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
var db = mongoose.connection;
db.once('open', function(){
    console.log('DB connected');
});
db.on('error', function(err){
    console.log('DB ERROR : ', err);
});

//Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

//Routes
app.use('/', require('./routes/home'));
app.use('/posts', require('./routes/posts'));

//Port setting
var port = 3001;
app.listen(port, function(){
    console.log('server on! http://localhost:'+port);
});