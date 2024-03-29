const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

let db;

const SCRIPT_COLLECTION = "script";
const USER_COLLECTION = "user";

function init(callback) {
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        // Save database object from the callback for reuse.
        db = database;
        console.log("Database connection ready");
        callback();
    });
}

function getScriptById(id, callback) {
    db.collection(SCRIPT_COLLECTION).findOne({ _id: new ObjectID(id) }, callback);
}

function getAllScripts(callback){
    db.collection(SCRIPT_COLLECTION).find({}).toArray(callback);
}

function createScript(script, callback) {
    db.collection(SCRIPT_COLLECTION).insertOne(script, callback);
}

function getUserByUsername(username, callback) {
    db.collection(USER_COLLECTION).findOne({username: username}, callback);
}

function getAllUsers(callback){
    db.collection(USER_COLLECTION).find({ "username": { $ne: "guest" }}).toArray(callback);
}

function createUser(username, level, saltedPass, salt, callback) {
    db.collection(USER_COLLECTION).insertOne({username: username, level: level, saltedPass: saltedPass, salt: salt}, callback);
}

function getUserScripts(username, callback) {
    db.collection(SCRIPT_COLLECTION).find({username: username}).toArray(callback);
}

function getRandomScripts(callback) {
    db.collection(SCRIPT_COLLECTION).find({ "username": { $ne: "presentation" }}).toArray(callback);
}

module.exports.getScriptById = getScriptById;
module.exports.createScript = createScript;
module.exports.getUserByUsername = getUserByUsername;
module.exports.createUser = createUser;
module.exports.getAllUsers = getAllUsers;
module.exports.getAllScripts = getAllScripts;
module.exports.getUserScripts = getUserScripts;
module.exports.getRandomScripts = getRandomScripts;
module.exports.init = init;
