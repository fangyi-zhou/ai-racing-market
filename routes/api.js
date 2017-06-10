const express = require('express');
const router = express.Router();
const database = require('../db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const TOKEN_SECRET = "secret";

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

router.get('/script/:id', function (req, res) {
  database.getScriptById(req.params.id, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get script");
    } else {
      res.status(200).json(doc);
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
            database.createUser(username, saltedPass, salt, function (err, doc) {
                if (err) {
                    handleError(res, err.message, "Failed to create new user")
                } else {
                    res.status(201).json();
                }
            })
        }
    })
});

router.post("/auth", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
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
                res.json({id_token: token});
            } else {
                res.status(403).json({error: "Invalid login"});
            }
        }
    })
});

module.exports = router;
