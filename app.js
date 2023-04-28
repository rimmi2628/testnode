const express=require('express');

const bodyParser = require('body-parser');

const path=require('path');
const ejs=require('ejs');
const session=require("express-session");
// const cookieParser = require('cookie-parser');
const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth2').Strategy;


const Userroute=require('./router/userroute');

const app=express();

app.set("view engine", "ejs");

const port=process.env.port ||3000;
app.use(bodyParser.json({ limit: '50mb' }));

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json());

app.use(Userroute);
const static_path=path.join(__dirname,"../","public");
app.use(express.static(static_path));


app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'cvfcgv' 
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(
    new GoogleStrategy(
      {
        clientID:"33201454915-3hgi9k5f24b2l7v7u0d65e6ntgchovil.apps.googleusercontent.com",
       clientSecret:"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",
       callbackURL: "http://localhost:3000/auth",
       passReqToCallback:true
      },
      function(request, accessToken, refreshToken, profile, done) {
        console.log(accessToken);
        console.log(refreshToken);
      console.log(profile);
          return done(null, profile);
      
      }
    )
  );
 

  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });
  


  

  app.get("/login", (req, res) => {
    res.render('login');
  });


  app.get('/google',
    passport.authenticate('google',{ scope:
        ['profile'] }
    
  
      )
     
   
      
      // res.send("helooo")
       
 
  
  
 
);
    
app.get('/auth',(req,res)=>{
res.send("hello")
  // function(req, res) {

  //   res.redirect('/login')}
});   



app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });