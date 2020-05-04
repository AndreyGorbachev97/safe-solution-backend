const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const keys = require("../keys");

const store = new MongoStore({
  collection: "sessions",
  uri: keys.MONGODB_URI,
});

module.exports = store;