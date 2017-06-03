const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID;

const SCRIPT_COLLECTION = "script";
let db;

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");
});

router.get('/script/:id', function (req, res) {
  db.collection(SCRIPT_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
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

  db.collection(SCRIPT_COLLECTION).insertOne(newScript, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new script.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

module.exports = router;
