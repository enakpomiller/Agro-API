


//jwt testing
app.get("/api/post", verifyToken, (req, res) => {
  jwt.verify(req.token, 'SecretKey', (err, authdata) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: " post created....", authdata });
      // res.json(post.filter(post => post.username === req.user.username));

    }

  });


});

app.post("/api/login", (req, res) => {
  const { id, username, email } = req.body;
  const user = {
    id: id,
    username: username,
    email: email
  }
  jwt.sign({ user }, 'SecretKey', { expiresIn: '60s' }, (err, token) => {
    res.json({ token })

  });// sending as payload


});


// format of token
//Aythorization: Bearer <access_token>

// verify Token
function verifyToken(req, res, next) {
  // get the auth header value
  const bearerHeader = req.headers['authorization'];
  // check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    // split at the space
    const bearer = bearerHeader.split(' '); // paased array
    //Get token from array 
    const bearerToken = bearer[1];
    // set the token
    req.token = bearerToken;
    // calling the next middle ware
    next();

  } else {
    // forbiden
    res.sendStatus(403);
  }

}