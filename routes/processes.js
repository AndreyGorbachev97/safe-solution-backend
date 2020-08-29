const { Router } = require("express");
const Process = require("../models/process");
const User = require("../models/user");
const router = Router();
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const processes = await Process.find();
  res.send(processes);
});

router.get("/:id", auth, async (req, res) => {
  const process = await Process.findById(req.params.id);
  res.send(process);
});
router.post("/add", auth, async (req, res) => {
  const process = new Process({
    title: req.body.title,
    stages: req.body.stages,
    state: req.body.state,
    userId: req.user,
  });
  try {
    process.save();
    await req.user.addToProcess(process);
    res.status(200);
    res.send(process);
  } catch (e) {
    console.log(e);
  }
});

router.post("/remove", async (req, res) => {
  try {
    await Process.deleteOne({ _id: req.body.id });
    res.redirect("/processes");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
