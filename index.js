const express = require("express");
const path = require("path");
cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const User = require("./models/user");
const Process = require("./models/process");
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
const socketUser = require("./socket/users")();
const keys = require("./keys");

const MONGODB_URI = keys.MONGODB_URI;
const app = express();
const server = require("http").createServer(app);
var sio = require("socket.io")(server);


app.use(
  cors({
    origin: ["https://discussion-doc.ru", "http://192.168.43.23:8080", "http://localhost:8080"],
    credentials: true,
  })
);

// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });

// app.use(function (req, res, next) {
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Origin", "https://discussion-doc.ru");
//   res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "origin, content-type, accept, authorization"
//   );
//   return next();
// });

// const whiteList = {
//   "https://discussion-doc.ru": true,  
// };
// const allowCrossDomain = function(req, res, next) {    
//       if(whiteList[req.headers.origin]){            
//           res.header('Access-Control-Allow-Credentials', true);
//           res.header('Access-Control-Allow-Origin', req.headers.origin);
//           res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//           res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Origin, Accept');        
//           next();
//       } 
// };
// app.use(allowCrossDomain);

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
app.use("/entity", entityRoutes);

const findCandidate = async (email) => {
  const candidate = await User.findOne({ email });
  return candidate;
};

//работа с сокетами
const m = (name, text, id) => ({ name, text, id });
sio.on("connection", function (socket) {
  if (socket.request.session.user) {
    socketUser.add({
      email: socket.request.session.user.email,
      id: socket.request.session.user._id,
      socketId: socket.id,
    });
    console.log(socketUser.getFull());
  }
  socket.on("process", async (data, cb) => {
    console.log('data:', data);
    console.log('users: ', socketUser.getFind(data.ids));
    socketUser.getFind(data.ids).forEach((user) => {
      socket.to(user.socketId).emit('changeProcess', { user: data.user, status: data.status });
    });
  })
  socket.on("solution", async (data, cb) => {
    if (!data.name || !data.room) {
      return cb('Данные некорректны')
    }

    cb({ userId: socket.id });
    console.log('new room:', data.room);
    socket.emit('changeSolution', m('admin', `Добро пожаловать ${data.name}`))
    socket.join(data.room);
    socket.to(data.room).emit('changeSolution', `Пользователь ${data.name} подключен`)
  });
  socket.on("answersSolutionRoom", (data, cb) => {
    //оповещаем всех, что процесс обновлен
    console.log("update process in ", data.room);
    console.log("author: ", data.author);
    sio.to(data.room).emit('changeSolution', data.room);
  });
  socket.on("message", function () {
    sio.emit("message");
  });
  socket.on("createMessage", function () { });
  socket.on("disconnect", function () {
    const user = socketUser.remove(socket.id);
    console.log('Пользователь отсоединился', user);
  });
});


const PORT = process.env.PORT || 3000;

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
