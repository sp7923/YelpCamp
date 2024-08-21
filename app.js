if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const methodOverride = require('method-override');
const ejsMate=require('ejs-mate');
const ExpressError=require('./utils/ExpressError');
const session=require('express-session');
const flash=require('connect-flash');
const passport=require('passport');
const localStrategy=require('passport-local');
const User=require('./models/user');

const campgroundRoutes=require('./routes/campground');
const reviewRoutes=require('./routes/reviews');
const userRoutes=require('./routes/users');

const username = encodeURIComponent('pc');
const password = encodeURIComponent('sourav');
const dbName = 'yelp-camp';

const uri = `mongodb://${username}:${password}@localhost:27017/${dbName}?authSource=admin`;

mongoose.connect(uri);

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
})


const app=express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

const sessionConfig={
    name:'session',
    secret:'thisshouldbeabettersecret!',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    if(!req.originalUrl.includes('/javascripts') && !req.originalUrl.includes('/stylesheets') && !['/login','/'].includes(req.originalUrl)){
        req.session.returnTo=req.originalUrl;
    }
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);

app.get('/',(req,res)=>{
    res.render('home');
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message) err.message='Oh Uh, Something Went Wrong!'
    res.status(statusCode).render('error',{err});
})

app.listen(3000,()=>{
    console.log('Serving on port 3000');
})