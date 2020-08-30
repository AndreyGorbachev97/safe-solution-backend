const User = require("../models/user");
const Entity = require("../models/entity");
const { Router } = require("express");
const bcrypt = require("bcryptjs");

const router = Router();

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Авторизация",
    isLogin: true,
    loginError: req.flash("loginError"),
    registerError: req.flash("registerError"),
  });
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.send({ isAuthenticated: false });
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const candidate = await User.findOne({ email });
    if (candidate) {
      console.log("candidate", candidate);
      const areSame = await bcrypt.compare(password, candidate.password);
      console.log(areSame);
      if (areSame) {
        // const token = jwt.sign(candidate._id.toString(), JWT_SCRET);
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            throw err;
          }
          res.send({ login: true });
        });
      } else {
        res.send({ message: "error login", login: false });
      }
    } else {
      req.send("loginError", "Такого пользователя не существует");
      res.redirect("/auth/login#login");
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email, phone, password, repeat, entity, name, surname } = req.body;
    //однонаправленное шифрование пароля
    const hashPassword = await bcrypt.hash(password, 10);
    //поиск пользователя в бд
    const candidate = await User.findOne({ email });
    //проверяем зареган ли он уже
    if (candidate) {
      //   req.flash("registerError", "Пользователь с таким email уже существует");
      res.send({ massage: "user exists", registration: false });
    } else {
      let entityCheck = await Entity.findOne({ name: entity });
      console.log("test2", entityCheck);
      if (!entityCheck) {
        entityCheck = new Entity({
          name: entity,
        });
        entityCheck.save();
      }
      const user = new User({
        email,
        phone,
        name,
        surname,
        entity,
        password: hashPassword,
        processes: { items: [] },
      });
      user.save();
      await entityCheck.addToMember(user);
      req.session.user = user;
      req.session.isAuthenticated = true;
      req.session.save();

      res.send({ massage: "user is registered", registration: true });
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
