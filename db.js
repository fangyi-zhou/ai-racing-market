const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

let db;

const SCRIPT_COLLECTION = "script";

function init() {
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        // Save database object from the callback for reuse.
        db = database;
        console.log("Database connection ready");
    });
}

function getScriptById(id, callback) {
    db.collection(SCRIPT_COLLECTION).findOne({ _id: new ObjectID(id) }, callback);
}

function createScript(script, callback) {
    db.collection(SCRIPT_COLLECTION).insertOne(script, callback);
}

module.exports.getScriptById = getScriptById;
module.exports.createScript = createScript;
module.exports.init = init;
