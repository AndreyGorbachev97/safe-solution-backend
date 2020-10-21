const express = require("express");
const path = require("path");
cors = require("cors");
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
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const { shouldSendSameSiteNone } = require('should-send-same-site-none');

const MONGODB_URI = keys.MONGODB_URI;

const app = express();
app.use(shouldSendSameSiteNone);
const server = require("http").createServer(app);

const store = new MongoStore({
  collection: "sessions",
  uri: keys.MONGODB_URI,
});

store.on('error', function (error) {
  console.log('error: ', error);
});

var sio = require("socket.io")(server);

app.use(
  cors({
    origin: ["https://discussion-doc.ru", "http://192.168.43.23:8080", "http://localhost:8080"],
    credentials: true,
  })
);

//store для добавления сессий в базу данных

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const sessionMiddleware = session({
  secret: keys.SESSION_SECRET,
  key: "sid",
  proxy: true,
  cookie: {
    maxAge: 604800000, //7 days in miliseconds
    httpOnly: true,
    // secure: true,
    // sameSite: 'none',
  },
  resave: false,
  saveUninitialized: false,
  store,
});

sio.use(function (socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);
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
  }
  socket.on("process", async (data, cb) => {
    socketUser.getFind(data.ids).forEach((user) => {
      socket.to(user.socketId).emit('addedProcess', { user: data.user, status: data.status });
    });
  })
  socket.on("solution", async (data, cb) => {
    if (!data.name || !data.room) {
      return cb('Данные некорректны')
    }

    cb({ userId: socket.id });
    socket.emit('changeSolution', m('admin', `Добро пожаловать ${data.name}`))
    socket.join(data.room);
    console.log(`Пользователь ${socket.id} подключен ${data.room}`);
    // socket.to(data.room).emit('changeSolution', `Пользователь ${data.name} подключен`)
  });
  socket.on("answersSolutionRoom", (data, cb) => {
    //оповещаем всех, что процесс обновлен
    const author = socketUser.getFindId(data.author.id);
    console.log(author);
    //если автор в сети, отправляем ему сообщение что процесс обновлен
    if (author[0]) {
      author.forEach((a) => {
        socket.to(a.socketId).emit("changeProcess", "update process");
      })
    }
    sio.to(data.room).emit("changeSolution", data.room);
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
