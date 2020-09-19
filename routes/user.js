const { Router } = require("express");
const router = Router();
const auth = require("../middleware/auth");

router.get("/", auth, (req, res) => {
  res.status(200);
  res.send({
    email: req.user.email,
    name: req.user.name,
    surname: req.user.surname,
    entity: req.user.entity,
  });
});

module.exports = router;
