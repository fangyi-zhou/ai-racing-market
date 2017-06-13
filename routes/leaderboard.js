const express = require('express');
const router = express.Router();
const database = require('../db');

/* GET leaderboard info. */
router.get('/leaderboard', function(req, res, next) {
    //TODO implements leaderboard databse
    // database.getAllUsers.find(function(err, todos) {
    //     if (err) {
    //         res.send(err);
    //     } else {
    //         res.json(todos);
    //     }
    // });
    res.json("foo");
});

module.exports = router;
