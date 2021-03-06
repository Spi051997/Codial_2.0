const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 7000;
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
// used for session cookie
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const Mongostore=require('connect-mongo');
const sassMiddleware =require('node-sass-middleware');


app.use(sassMiddleware({
    src: './assets/scss',
    dest: './assets/css',
    debug: true,
    outputStyle: 'extended',
    prefix: '/css'
}));
app.use(express.urlencoded());

app.use(cookieParser());

app.use(express.static('./assets'));

app.use(expressLayouts);
// extract style and scripts from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);




// set up the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// mongo store is used to store the session cookie in the db
app.use(session({
    name:'codial',
    // to do change the secret before the deployment in production
    secret:'xxxxxxx',
    saveUninitialized:true,
    resave:false,
    cookie:{
        maxAge:(1000*60*100)
    },
    store: Mongostore.create({
        mongoUrl: 'mongodb+srv://admin:admin@cluster0.efyft.mongodb.net/Codial?retryWrites=true&w=majority',
        autoRemove:'disabled'
    },(err)=>
    {
        console.log(err || 'Mongo setup error is up!!')
    }
    )
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

// use express router
app.use('/', require('./routes'));


app.listen(port, function(err){
    if (err){
        console.log(`Error in running the server: ${err}`);
    }

    console.log(`Server is running on port: ${port}`);
});
