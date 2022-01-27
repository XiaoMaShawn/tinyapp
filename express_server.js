const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');


//create the server
const app = express();
const port = 8080;

//set the view engine to ejs
app.set('view engine', 'ejs')
//body parse the content
app.use(bodyParser.urlencoded({ extended: true }));
//cookie parse 
app.use(cookieParser());

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// }

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

function urlsForUser(id, urls) {
  let userURL = {};
  for (let url in urls) {
    if (urls[url].userID === id) {
      userURL[url] = {
        longURL: urls[url].longURL
      }
    }
  }
  return userURL;
}

//check the users with email
function existEmail(email, users) {
  for (let user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
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

const getUserByEmail = (email) => {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
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
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  if (req.cookies['user_id']) {
    const userURL = urlsForUser(req.cookies['user_id'], urlDatabase)
    templateVars.urls = userURL
    return res.render("urls_index", templateVars);
  }
  res.render('pleaseloginfirst', templateVars)
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  if (!templateVars.user) {
    return res.redirect('/urls')
  }
  return res.render('urls_new', templateVars);

})

//after the submit in /urls/new, generate a random shortURL, put it in the urlDatabase with the correlated longURL.
//then redirect to the /urls/:shortURL
app.post('/urls', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
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
    user: users[req.cookies['user_id']]
  }
  if (req.cookies['user_id']) {
    const userURL = urlsForUser(req.cookies['user_id'], urlDatabase)
    templateVars.shortURL = req.params.shortURL;
    templateVars.longURL = userURL[req.params.shortURL].longURL
    return res.render('urls_show', templateVars);
  }

})

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.updatedURL;
  return res.redirect('/urls');
})

app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    // return res.redirect(`https://${longURL}`);
    return res.redirect(longURL);
  }
  res.send('the shortURL is invalid');
})

//click the delete button and redirect to the /urls page
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})



app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!existEmail(email, users)) {
    return res.status(403).send('This email hasn\'t been registered')
  }

  const user = getUserByEmail(email);
  console.log(user);
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('your password is wrong')
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');

})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
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
      email: email,
      password: password
    }
    res.cookie('user_id', users[userID].id);
    res.redirect('/urls');
  }
})

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  if (!templateVars.user) {
    return res.render('loginpage', templateVars)
  }
  res.redirect('/urls');
})

app.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});

