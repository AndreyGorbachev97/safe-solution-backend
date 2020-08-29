const mongo = require("mongodb").MongoClient;
const User = require("../models/user");
const keys = require("../keys");

module.exports = function (server) {
  const io = require("socket.io")(server);

  mongo.connect(keys.MONGODB_URI, (err, client) => {
    if (err) {
      console.log("Connection error: ", err);
      throw err;
    }

    console.log("Connected");
    const db = client.db("business-process");
    const users = db
      .collection("users")
      .findOne({}, function (findErr, result) {
        if (findErr) throw findErr;
        console.log(result);
        client.close();
      });

    // io.on("connection", (socket) => {
    //   console.log("io connection");
    //   socket.emit("news", { hello: "hello world" });

    //   const username = socket.handshake.user.get("username");
    //   console.log("user", username);
    // });

    client.close();
  });
};
