var express = require('express');
var router = express.Router();
var users = require('../model/users');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.status(200).send({
    success: 'true',
    message: 'Retrive users successfully',
    users: users,
  });
});

router.post('/user/register', function(req, res, next) {
  if (!req.body.name) {
    return res.status(400).send({
      success: 'false',
      message: 'Name must exist'
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
    password: req.body.password
  }

  users.push(user);
  res.status(200).send({
    success: 'true',
    message: 'User has created sucessfully'
  });
});

module.exports = router;
