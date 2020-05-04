const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

io.set("origins", "*:*");

io.on("connection", (socket) => {
  console.log("io connection");
});

module.exports = {
  app,
  server,
};
