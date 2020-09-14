const { Router } = require("express");
const router = Router();
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  res.send(req.user.solutions);
});

module.exports = router;