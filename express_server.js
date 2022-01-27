const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
// const res = require('express/lib/response');
// const { render } = require('express/lib/response');

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

const users = {
  "123": {
    id: "123",
    email: "lulu@fancy.com",
    password: "purple"
  },
  "456": {
    id: "456",
    email: "him@tell.com",
    password: "green"
  }
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
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render('urls_new', templateVars);

})

//after the submit in /urls/new, generate a random shortURL, put it in the urlDatabase with the correlated longURL.
//then redirect to the /urls/:shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
})

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
  // templateVars.shortURL = req.params.shortURL;
  // templateVars.longURL = urlDatabase[req.params.shortURL];
  // res.render('urls_show', templateVars);
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
  const email = req.body.email;
  const password = req.body.password;
  if (existEmail(email, users) === false) {
    res.status(403).send('This email hasn\'t been registered')
  } else {
    let checkKey;
    for (let user in users) {
      if (email === users[user].email) {
        checkKey = user;
        break;
      }
    }
    if (password !== users[checkKey].password) {
      res.status(403).send('your password is wrong')
    } else {
      res.cookie('user_id', users[checkKey].id);
      res.redirect('/urls');
    }
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  res.render('registration_form')
})

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();
  if (!email || !password) {
    res.status(404).send('email or password can not be empty').end();
  } else if (existEmail(email, users)) {
    res.status(404).send('your email has been registered').end();
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
  res.render('loginpage')
})

app.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});

