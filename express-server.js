const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({ extended: true }));

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

app.get('/', (req, res) => {
  res.send('Hello!');
});

// Respond to Get request with JSON object
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Respond to Get request with HTML response
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  const urlDB = { urls: urlDatabase };
  res.render('urls_index', urlDB);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => {
  const urlDB = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', urlDB);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
