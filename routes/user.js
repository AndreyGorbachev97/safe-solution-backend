const { Router } = require("express");
const router = Router();
const auth = require("../middleware/auth");

router.get("/", auth, (req, res) => {
  console.log(req.session);
  res.status(200);
  console.log("user...", req.user);
  res.send({ ...req.user._doc, isAuthenticated: req.session.isAuthenticated });
});

module.exports = router;
