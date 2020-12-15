const express = require('express');
const app = express();
const configRoutes = require('./routes');
const seed = require('./tasks/seed')

const session = require('express-session');
const exphbs = require('express-handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true}));


const static = express.static(__dirname + '/public');
app.use('/public', static);

app.engine('handlebars',exphbs({ defaultLayout: false}));
app.set('view engine', 'handlebars');

app.use(
  session({
    name: 'AuthCookie',
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: true,
    resave: false
  })
);

app.use((req, res, next) => {
  if(req.session.user){
    req.x = 'Authenticated'
  } else {
    req.x = 'Unathenticated'
  }
  console.log(new Date().toUTCString(), req.method, req.originalUrl, req.x)
  next()
});

function checkSession(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    return res.render('./login');
  }
};

app.get('/', checkSession, function(req, res){
  return res.redirect('./private');
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});