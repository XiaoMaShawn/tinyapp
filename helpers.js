const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
}

function existEmail(email, users) {
  for (let user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
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






module.exports = { getUserByEmail, existEmail, urlsForUser, generateRandomString }