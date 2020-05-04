const express = require("express");
const path = require("path");
cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const csrf = require("csurf"); //пакет CSRF - защиты
const mongoose = require("mongoose");
const addRoutes = require("./routes/add");
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");
const processesRoutes = require("./routes/processes");
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");
const bodyParser = require("body-parser");
const varMIddleware = require("./middleware/variables");
const keys = require("./keys");

const MONGODB_URI = keys.MONGODB_URI;
const app = express();
const server = require("http").createServer(app);

app.use(
  cors({
    origin: "http://192.168.43.20:8080",
    credentials: true,
  })
);
// app.use(function(req, res, next) {
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Origin", "http://192.168.43.20:8080");
//   res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "origin, content-type, accept, authorization");
//   return next();
// });

//store для добавления сессий в базу данных
const store = require("./lib/sessionStore");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    //строка на основе которой шифруетя сессия
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
  })
);
//app.use(csrf());
app.use(varMIddleware);

app.use(bodyParser.json());
//routes
app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/processes", processesRoutes);
app.use("/auth", authRoutes);
app.use("/task", taskRoutes);
app.use("/user", userRoutes);

const PORT = process.env.port || 3000;

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    //подключаем сокеты
    require("./socket")(server);
  } catch (e) {
    console.log(e);
  }
}

start();
