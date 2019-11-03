var express = require('express');
var router = express.Router();
var sql = require('../model/users');
var mysql = require('mysql');
const jwt = require('jsonwebtoken');
const passport = require("passport");
require('../passport')(passport);

/* GET users listing. */
router.get('/', function(req, res, next) {
  sql.query("select * from users", function (err, data) {
    if (err) throw err;
    res.json(data)
  });
});

router.post('/register', function(req, res, next) {
  if (!req.body.name) {
    return res.status(400).send({
      success: 'false',
      message: 'Name must exist'
    })
  }

  if (!req.body.email) {
    return res.status(400).send({
      success: 'false',
      message: 'Email must exist'
    })
  }

  if (!req.body.password) {
    return res.status(400).send({
      success: 'false',
      message: 'Password must exist'
    })
  }

  if (!req.body.re_password) {
    return res.status(400).send({
      success: 'false',
      message: 'RePassword must exist'
    })
  }
  
  if (req.body.re_password != req.body.password) {
    return res.status(400).send({
      success: 'false',
      message: 'Password and RePassword must be the same'
    })
  }

  const user = {
    name: req.body.name,
    password: req.body.password,
    email: req.body.email
  }

  let insertQuery = 'INSERT INTO ?? (??,??,??) VALUES (?,?,?)';
  let query = mysql.format(insertQuery,["users","email","name","password",
                                        user.email, user.name, user.password]);
  sql.query(query, function (err, data) {
    if (err) {
      res.status(500).send({
        success: 'false',
        message: 'Email has been regitered'
      });
      return;
    }
    res.status(200).send({
      success: 'true',
      message: 'User has created sucessfully'
    });
  });
});

/* POST login. */
router.post('/login', function (req, res, next) {
  passport.authenticate('local-login', {session: false}, (err, user, info) => {
    var result = JSON.parse(JSON.stringify(user));
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user   : result
      });
    }
    req.login(result, {session: false}, (err) => {
       if (err) {
         res.send(err);
       }
       const token = jwt.sign(result, 'your_jwt_secret');
       return res.json({token});
    });
  })(req, res, next);
});
module.exports = router;
