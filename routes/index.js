var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.email = '';
  res.redirect('/users/');
});

module.exports = router;
