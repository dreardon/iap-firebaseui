const { jwtDecode } = require('jwt-decode');
const cors = require("cors");

require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const { auth } = require('express-openid-connect');

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static(path.join(__dirname,'public')));
app.use(cors({ origin: true }));

app.use(session({
  resave: true,
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false
}));

const auth_config = {
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET,
  idpLogout: true,
  authRequired: false,
  authorizationParams: {
    response_type: 'id_token',
    scope: 'openid profile email',
  },
  afterCallback: (req, res, session) => {
    const claims = jwtDecode(session.id_token);
    return session;
  }
}

app.use(auth(auth_config));

app.get('/', (req, res) => {
  var iap_user = req.headers["x-goog-authenticated-user-email"]
  var iap_jwt_assertion = req.headers["x-goog-iap-jwt-assertion"]

  if (iap_jwt_assertion) {
    var decoded_iap_jwt = jwtDecode(iap_jwt_assertion)
    var provider = decoded_iap_jwt.gcip.firebase.sign_in_provider
  } else {
    var decoded_iap_jwt = ""
  }
  res.render('login', { provider: provider || 'None', decoded_iap_jwt: decoded_iap_jwt, iap_user: iap_user, isAuthenticated: req.oidc ? req.oidc.isAuthenticated() : false });
});

app.get('/profile', requireAuth, (req, res) => {
  provider = req.query.provider || 'None'
  res.render('profile', { idToken: req.oidc.idToken, user: req.oidc.user, provider: provider });
});

function requireAuth(req, res, next) {
  if (!req.oidc.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}
const PORT = process.env.PORT || 8080;
var server = app.listen(PORT, function () {
  console.log('Listening on port %d', server.address().port)
});