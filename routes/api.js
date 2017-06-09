const express = require('express');
const router = express.Router();
const database = require('../db');

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

router.get('/script/:id', function (req, res) {
  database.getScriptById(req.params.id, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get contact");
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

module.exports = router;
