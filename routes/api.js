const express = require('express');
const router = express.Router();
const database = require('../db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const TOKEN_SECRET = "secret";

const raceBack = require('../environment/raceBack');

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

router.get('/user/:username', function (req, res) {
    database.getUserScripts(req.params.username, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get script");
        } else {
            res.status(200).json(doc);
        }
    });
});

router.get('/script/:id', function (req, res) {
  database.getScriptById(req.params.id, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get script");
    } else {
      res.status(200).json(doc);
    }
  });
});

router.get('/script', function(req,res){
    database.getAllScripts(function(err, scripts) {
        if (err) {
            res.send(err);
        } else {
            res.json(scripts);
        }
    });
});

router.post("/script", function(req, res) {
  const newScript = req.body;
  newScript.createDate = new Date();

  if (!req.body.code) {
    handleError(res, "Invalid user input", "Must provide code.", 400);
  }

  database.createScript(newScript, function (err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new script.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

router.post("/register", function(req, res) {
    const username = req.body.username;
    const passwordHashed = req.body.password;
    const level = req.body.level;
    console.log('level', level)
    console.log(passwordHashed);
    const salt = crypto.randomBytes(48).toString('hex');
    database.getUserByUsername(username, function (err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get user");
        } else if (doc !== null) {
            res.status(400).json({error: "User already exists"});
        } else {
            const hash = crypto.createHash("sha256");
            hash.update(passwordHashed);
            hash.update(salt);
            const saltedPass = hash.digest('hex');
            database.createUser(username, level, saltedPass, salt, function (err, doc) {
                if (err) {
                    handleError(res, err.message, "Failed to create new user")
                } else {
                    const token = jwt.sign({ username: username }, process.env.TOKEN_SECRET || TOKEN_SECRET);
                    res.json({id_token: token, username: username});
                }
            })
        }
    })
});

router.post("/auth", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const level = req.body.level;
    database.getUserByUsername(username, function (err, doc) {
        if (err){
            handleError(res, err.message, "Failed to authenticate user")
        } else if (doc === null) {
            res.status(403).json({error: "Invalid login"});
        } else {
            const salt = doc.salt;
            const pass = doc.saltedPass;
            const hash = crypto.createHash("sha256");
            hash.update(password);
            hash.update(salt);
            if (hash.digest('hex') === pass) {
                const token = jwt.sign({ username: username }, process.env.TOKEN_SECRET || TOKEN_SECRET);
                res.json({id_token: token, username: username , level: level});
            } else {
                res.status(403).json({error: "Invalid login"});
            }
        }
    })
});

router.get("/statistics", function (req,res){
   //TODO implement statistics of AI/User
    res.json([{id:'foo', value:Math.PI}]);
});

router.get("/sims", function(req,res){
    let ans = raceBack.getAllSims();
    res.json(ans);
})

router.post("/sims", function(req,res){
    //Random selected AI
    raceBack.addSim(req.body.id, req.body.mode, req.body.AI);
    res.json("yes");
});

module.exports = router;
