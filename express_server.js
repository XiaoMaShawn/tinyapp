const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const res = require('express/lib/response');
const { render } = require('express/lib/response');

//create the server
const app = express();
const port = 8080;

//set the view engine to ejs
app.set('view engine', 'ejs')
//body parse the content
app.use(bodyParser.urlencoded({ extended: true }));
//cookie parse 
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

const templateVars = {
  username: null,
  urls: urlDatabase
}

//get a shorten URL string
function generateRandomString() {
  let strPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    + "0123456789"
    + "abcdefghijklmnopqrstuvxyz";
  let result = '';
  for (let i = 0; i < 6; i++) {
    let index = parseInt(strPool.length * Math.random());
    result += strPool.charAt(index);
  }
  return result;
}

//get the home page show the hello
app.get('/', (req, res) => {
  res.send('Hello!')
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.get("/urls", (req, res) => {
  templateVars.username = req.cookies['username']
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})

//after the submit in /urls/new, generate a random shortURL, put it in the urlDatabase with the correlated longURL.
//then redirect to the /urls/:shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
})

app.get('/urls/:shortURL', (req, res) => {
  const temp = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', temp);
})

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updatedURL;
  res.redirect('/urls');
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

//click the delete button and redirect to the /urls page
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})


app.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});

