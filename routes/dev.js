/**
 * Created by ruiaohu on 02/06/2017.
 */
var express = require('express');
var router = express.Router();

/* GET dev environment listing. */
router.get('/', function(req, res, next) {
  //res.send(express.static(__dirname + 'public'));
});

module.exports = router;
