const { Router } = require("express");
const router = Router();
const auth = require("../middleware/auth");
const generatingList = require('../helpers/generatingReconciliationSheet');

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
