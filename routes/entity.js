const { Router } = require("express");
const Entity = require("../models/entity");
const router = Router();
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const entity = await Entity.findOne({ name: req.query.name });
  res.send(entity.members);
});

module.exports = router;
