var authConfig = require('./config/auth')
var express = require('express')
var passport = require('passport')
var bodyParser = require('body-parser')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
var app = express()
var server = require('http').createServer(app)

var session = require('express-session')
var port = 3000
var temp_user = ''

app.set('view engine', 'hbs')
app.use(bodyParser.json({
  limit: '50mb'
}))
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}))

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  })
)

app.use(passport.initialize())
app.use(passport.session())
app.use(express.static('public'))

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (obj, done) {
  done(null, obj)
})

passport.use(
  new GoogleStrategy(authConfig.google, function (accessToken, refreshToken, profile, done) {
    return done(null, profile)
  })
)

app.get('/', function (req, res) {
  res.render('index', {
    user: req.user
  })
})

app.get('/login', function (req, res) {
  res.render('login', {
    user: req.user
  })
})

app.get('/auth/google', passport.authenticate('google', {
  scope: ['openid', 'email', 'profile']
}))

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login'
}), function (req, res) {
  res.redirect('/account')
})

app.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account', {
    user: req.user
  })
})

app.get('/logout', function (req, res) {
  req.logout()
  temp_user = ''
  res.redirect('/')
})

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('Welcome ' + req.user.displayName)
    console.log(req.user.emails[0].value)
    temp_user = req.user.displayName
    return next()
  } else {
    console.log('Please login with valid user')
    req.logout()
    res.redirect('/login')
  }
}

server.listen(port, function () {
  console.log('Listening on http://localhost:' + `${port}`)
})