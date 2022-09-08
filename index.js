var path = require ('path');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); 
var session = require('express-session');
var cookieParser = require('cookie-parser');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname + '/views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: "Your secret key", resave: true, saveUninitialized: false}));

var Users = [];

app.get('/signup', function(req, res){
   res.render('signup');
});

app.post('/signup', function(req, res){
   if(!req.body.id || !req.body.password){
      res.status("400");
      res.send("Invalid details!");
   } else {
      Users.filter(function(user){
         if(user.id === req.body.id){
            res.render('signup', {
               message: "User Already Exists! Login or choose another user id"});
         }
      });
      var newUser = {id: req.body.id, password: req.body.password};
      Users.push(newUser);
      console.log(newUser);
      req.session.user = newUser;
      res.redirect('/protected_page');
   }
});

app.get('/login', function(req, res){
   res.render('login');
});

app.post('/login', function(req, res){
   if(!req.body.id || !req.body.password){
      res.render('login', {message: "Please enter both id and password"});
   } else {

      let credentials_valid = false;
      Users.filter(function(user){
         if(user.id === req.body.id && user.password === req.body.password){
            req.session.user = user;
            console.log(user);
            res.redirect('/protected_page');
            credentials_valid = true;
         }
      });
      if (!credentials_valid)
      {
         res.render('login', {message: "Invalid credentials!"});
      }
   }
});

app.use('/protected_page', function(req, res, next){
   if (req.session.user) {
      next();     //If session exists, proceed to page
   } else {
      res.redirect('/login');
   }
});

app.get('/protected_page', function(req, res){
   res.render('protected_page', {id: req.session.user.id})
});

app.get('/logout', function(req, res){
   req.session.destroy(function(){
      console.log("user logged out.")
   });
   res.redirect('/login');
});

app.listen(8080);