const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');


const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['Talkin it up on the Barry Gibb talk show Talkin bout issues'],
  age: (24 * 60 * 60 * 1000)
}));

app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'aJ48lw' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'aJ48lw' },
  m8Z29o: { longURL: 'http://www.github.com', userID: 'L6f2iG' },
  km9iGH: { longURL: 'http://www.duckduckgo.com', userID: 'L6f2iG' }
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    hashedPassword: bcrypt.hashSync('purple-monkey-dinosaur', 10)
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    hashedPassword: bcrypt.hashSync('dishwasher-funk', 10)
  },
  aJ48lw: {
    id: 'aJ48lw',
    email: 'test@example.com',
    hashedPassword: bcrypt.hashSync('bestpassword', 10)
  },
  L6f2iG: {
    id: 'L6f2iG',
    email: 'test2@example.com',
    hashedPassword: bcrypt.hashSync('12345', 10)
  }
};

function generateRandomString() {
  const tempArray = [];
  const alphaNum = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  for (let i = 0; i < 6; i++) {
    const randCharIndex = Math.floor(Math.random() * alphaNum.length);
    tempArray.push(alphaNum[randCharIndex]);
  }
  return tempArray.join('');
}

//  Verify email not duplicate
function emailLookup(emailCheck) {
  for (const id in users) {
    if (emailCheck === users[id].email) {
      return users[id];
    }
  }
  return false;
}

//  Look up user by cookie ID
function cookieChecker(userID) {
  let currentUser;
  for (const id in users) {
    if (userID === users[id].id) {
      currentUser = users[id];
    }
  }
  return currentUser;
}

//  Populate object of user URLs
function userUrlLookup(userID) {
  const userURLs = {};
  for (const tiny in urlDatabase) {
    if (urlDatabase[tiny].userID === userID) {
      userURLs[tiny] = urlDatabase[tiny];
    }
  }
  return userURLs;
}

//  Root placeholder page
app.get('/', (req, res) => {
  const currentUser = cookieChecker(req.session.user_id);
  if (currentUser) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//  New user registration page
app.get('/register', (req, res) => {
  const currentUser = cookieChecker(req.session.user_id);
  const ejsVars = {
    userInfo: currentUser
  };
  if (currentUser) {
    res.redirect('/urls');
  } else {
    res.render('urls_reg', ejsVars);
  }
});

//  Login page
app.get('/login', (req, res) => {
  const currentUser = cookieChecker(req.session.user_id);
  const ejsVars = {
    userInfo: currentUser
  };
  if (currentUser) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', ejsVars);
  }
});

//  Read index of all TinyURL
app.get('/urls', (req, res) => {
  const currentUser = cookieChecker(req.session.user_id);
  const ejsVars = { userInfo: currentUser };
  if (currentUser) {
    ejsVars.userInfo = currentUser.email;
    const userURLs = userUrlLookup(currentUser.id);
    ejsVars.urls = userURLs;
    res.render('urls_index', ejsVars);
  } else {
    res.redirect('/login');
  }
});

//  Page to make new TinyURL
app.get('/urls/new', (req, res) => {
  const currentUser = cookieChecker(req.session.user_id);
  const ejsVars = {
    userInfo: currentUser
  };
  if (!currentUser) {
    res.redirect('/login');
  } else {
    ejsVars.userInfo = currentUser.email;
    res.render('urls_new', ejsVars);
  }
});

//  Read page for specified TinyURL
app.get('/urls/:shortURL', (req, res) => {
  const currentUser = cookieChecker(req.session.user_id);
  if (!currentUser || urlDatabase[req.params.shortURL].userID !== currentUser.id) {
    res.redirect('/login');
  } else if (urlDatabase[req.params.shortURL].userID === currentUser.id) {
    const ejsVars = {
      userInfo: currentUser.email,
      shortURL: req.params.shortURL,
      myUrl: true,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render('urls_show', ejsVars);
  }
});

//  Redirect to longURL given TinyURL
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(404).send('Site not found');
  }
});

//  Get the users login name and add it to cookies
app.post('/login', (req, res) => {
  const currentUser = emailLookup(req.body.email);
  if (!currentUser) {
    res.status(403).send('An account was not found with that email');
  } else if (!bcrypt.compareSync(req.body.password, currentUser.hashedPassword)) {
    res.status(403).send('Incorrect email & password combination.');
  } else {
    req.session.user_id = currentUser.id;
    res.redirect('/urls');
  }
});

//  Register a new user
app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('You must register with both an email and a password.');
  } else if (emailLookup(req.body.email)) {
    res.status(400).send('An account is already registered with that email.');
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: req.body.email,
      hashedPassword: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = newUserID;
    res.redirect('/urls');
  }
});

//  Logout the user
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//  Generate a TinyUrl for new longURL and post/route to main index
app.post('/urls', (req, res) => {
  const currentUser = cookieChecker(req.session.user_id);
  if (currentUser) {
    let tempLongURL = req.body.longURL;
    if (req.body.longURL.slice(0, 4) !== 'http') {
      tempLongURL = `http://${req.body.longURL}`;
    }
    const tempShortURL = generateRandomString();
    urlDatabase[tempShortURL] = {
      longURL: tempLongURL,
      userID: currentUser.id
    };
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//  Assign a new longURL for a given TinyURL and route to main index
app.post('/urls/:shortURL', (req, res) => {
  let tempLongURL = req.body.longURL;
  const currentUser = cookieChecker(req.session.user_id);
  if (currentUser && (currentUser.id === urlDatabase[req.params.shortURL].userID)) {
    if (req.body.longURL.slice(0, 4) !== 'http') {
      tempLongURL = `http://${req.body.longURL}`;
    }
    urlDatabase[req.params.shortURL].longURL = tempLongURL;
  }
  res.redirect('/urls');
});

//  Delete the urlDatabase entry associated with TinyURL and route to main index
app.post('/urls/:shortURL/delete', (req, res) => {
  const currentUser = cookieChecker(req.session.user_id);
  if (currentUser && (currentUser.id === urlDatabase[req.params.shortURL].userID)) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
