const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session')
const { getUserByEmail, existEmail, urlsForUser, generateRandomString } = require('./helpers')


//create the server
const app = express();
const port = 8080;

//set the view engine to ejs
app.set('view engine', 'ejs')
//body parse the content
app.use(bodyParser.urlencoded({ extended: true }));
// cookie-session
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

//example urlDatabase
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

//example usersDatabase
const users = {
  "123": {
    id: "123",
    email: "lulu@fancy.com",
    password: bcrypt.hashSync("purple", 10)
  },
  "456": {
    id: "456",
    email: "him@tell.com",
    password: bcrypt.hashSync("green", 10)
  }
}


app.get('/', (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  }
  if (templateVars.user) {
    return res.redirect('/urls');
  }
  res.redirect('login');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  }
  if (req.session['user_id']) {
    templateVars.urls = urlsForUser(req.session['user_id'], urlDatabase)
    return res.render("urls_index", templateVars);
  }
  res.render('pleaseloginfirst', templateVars)
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']],
  };
  if (!templateVars.user) {
    return res.redirect('/login')
  }
  return res.render('urls_new', templateVars);
})

app.post('/urls', (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  };
  if (!templateVars.user) {
    return res.send('please log in to shorten URLs')
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: templateVars.user.id
  }
  return res.redirect(`/urls/${shortURL}`)
})

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  }
  if (templateVars.user) {
    if (urlDatabase[req.params.shortURL] && urlDatabase[req.params.shortURL].userID === templateVars.user.id) {
      const userURL = urlsForUser(req.session['user_id'], urlDatabase)
      templateVars.shortURL = req.params.shortURL;
      templateVars.longURL = userURL[req.params.shortURL].longURL
      return res.render('urls_show', templateVars);
    } else {
      return res.send('There is no such shortURL in your list!Please check')
    }
  }
  res.render('pleaseloginfirst', templateVars)
})

app.post('/urls/:shortURL', (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  }
  if (templateVars.user) {
    if (urlDatabase[req.params.shortURL].userID === templateVars.user.id) {
      urlDatabase[req.params.shortURL].longURL = req.body.updatedURL;
      return res.redirect('/urls');
    } else {
      return res.send('Sorry you dont have the URL in your list')
    }
  }
  res.render('pleaseloginfirst', templateVars)
})

app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    return res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
  res.send('the shortURL is invalid');
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  }
  if (templateVars.user) {
    if (urlDatabase[req.params.shortURL].userID === templateVars.user.id) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
    }
  }
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!existEmail(email, users)) {
    return res.status(403).send('This email hasn\'t been registered')
  }
  const user = getUserByEmail(email, users);
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('your password is wrong')
  }
  req.session['user_id'] = user.id;
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  req.session['user_id'] = null;
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  };
  if (!templateVars.user) {
    return res.render('registration_form', templateVars)
  }
  res.redirect('/urls');
})

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const userID = generateRandomString();
  if (!email || !password) {
    return res.status(404).send('email or password can not be empty');
  } else if (existEmail(email, users)) {
    return res.status(404).send('your email has been registered');
  } else {
    users[userID] = {
      id: userID,
      email,
      password,
    }
    req.session['user_id'] = users[userID].id;
    res.redirect('/urls');
  }
})

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']],
  };
  if (!templateVars.user) {
    return res.render('loginpage', templateVars)
  }
  res.redirect('/urls');
})

app.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});

