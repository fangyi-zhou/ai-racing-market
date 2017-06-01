var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(express.static(__dirname + "../dist"));
  //res.render('index', { title: 'Express' });
});

module.exports = router;
