const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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
//  Root placeholder page
app.get('/', (req, res) => {
  res.send('Hello!');
});

//  Read a JSON version of urlDatabase
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//  HTML Hello page
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//  Read index of all TinyURL
app.get('/urls', (req, res) => {
  const ejsVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render('urls_index', ejsVars);
});

//  Page to make new TinyURL
app.get('/urls/new', (req, res) => {
  const ejsVars = { username: req.cookies.username };
  res.render('urls_new', ejsVars);
});

//  Read page for specified TinyURL
app.get('/urls/:shortURL', (req, res) => {
  const ejsVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render('urls_show', ejsVars);
});

//  Redirect to longURL given TinyURL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//  Get the users login name and add it to cookies
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

//  Logout the user
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

//  Generate a TinyUrl for new longURL and post/route to main index
app.post('/urls', (req, res) => {
  if (req.body.longURL.slice(0, 4) !== 'http') {
    const fixedLongURL = `http://${req.body.longURL}`;
    urlDatabase[generateRandomString()] = fixedLongURL;
    res.redirect('/urls');
  } else {
    urlDatabase[generateRandomString()] = req.body.longURL;
    res.redirect('/urls');
  }
});

//  Assign a new longURL for a given TinyURL and route to main index
app.post('/urls/:shortURL', (req, res) => {
  if (req.body.longURL.slice(0, 4) !== 'http') {
    const fixedLongURL = `http://${req.body.longURL}`;
    urlDatabase[req.params.shortURL] = fixedLongURL;
    res.redirect('/urls');
  } else {
    urlDatabase[req.params.shortURL] = req.body.longURL;
    res.redirect('/urls');
  }
});

//  Delete the urlDatabase entry associated with TinyURL and route to main index
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
