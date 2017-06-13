const express = require('express');
const router = express.Router();
const database = require('../db');

/* GET leaderboard info. */
router.get('/', function(req, res, next) {
    database.getAllUsers(function(err, users) {
        if (err) {
            res.send(err);
        } else {
            let result = [];
            for(let i in users){
                result.push({name: users[i].username, id: users[i]._id});
            }
            res.json(result);
        }
    });
});

module.exports = router;
