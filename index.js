const express = require("express");
const path = require("path");
cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const User = require("./models/user");
const csrf = require("csurf"); //пакет CSRF - защиты
const helmet = require("helmet"); //защита от атак
const mongoose = require("mongoose");
const addRoutes = require("./routes/add");
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");
const entityRoutes = require("./routes/entity");
const processesRoutes = require("./routes/processes");
const solutionsRoutes = require("./routes/solutions");
const userRoutes = require("./routes/user");
const bodyParser = require("body-parser");
const varMIddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user");
const keys = require("./keys");

const MONGODB_URI = keys.MONGODB_URI;
const app = express();
const server = require("http").createServer(app);
var sio = require("socket.io")(server);

app.use(
  cors({
    origin: ["http://192.168.43.23:8080", "http://localhost:8080"],
    credentials: true,
  })
);
// app.use(function (req, res, next) {
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Origin", "http://192.168.43.23:8080");
//   res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "origin, content-type, accept, authorization"
//   );
//   return next();
// });

//store для добавления сессий в базу данных
const store = require("./lib/sessionStore");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const sessionMiddleware = session({
  secret: keys.SESSION_SECRET,
  key: "sid",
  cookie: {
    path: "/",
    _expires: null,
    originalMaxAge: null,
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: false,
  store,
});

sio.use(function (socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);

// app.use(
//   session({
//     //строка на основе которой шифруетя сессия
//     secret: keys.SESSION_SECRET,
//     key: "sid",
//     cookie: {
//       path: "/",
//       _expires: null,
//       originalMaxAge: null,
//       httpOnly: true,
//     },
//     resave: false,
//     saveUninitialized: false,
//     store,
//   })
// );
//app.use(csrf());
app.use(helmet());
app.use(varMIddleware);
app.use(userMiddleware);

app.use(bodyParser.json());
//routes
app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/processes", processesRoutes);
app.use("/solutions", solutionsRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/emtity", entityRoutes);

const findCandidate = async (email) => {
  const candidate = await User.findOne({ email });
  console.log("candidate", candidate);
  return candidate;
};
sio.on("connection", function (socket) {
  //findCandidate(socket.request.session.user.email);
  socket.on("message", function () {
    sio.emit("message");
  });
  socket.on("createMessage", function () {});
  socket.on("disconnect", function () {
    sio.emit("Пользователь отсоединился");
  });
});

const PORT = process.env.port || 80;

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    //подключаем сокеты
    //require("./socket")(server);
  } catch (e) {
    console.log(e);
  }
}

start();
