const { Router } = require("express");
const router = Router();
const auth = require("../middleware/auth");

router.get("/", auth, (req, res) => {
  console.log(req.session);
  res.status(200);
  res.send(req.session);
});

module.exports = router;
