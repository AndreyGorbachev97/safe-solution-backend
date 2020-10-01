const { Router } = require("express");
const router = Router();
const auth = require("../middleware/auth");
const Process = require("../models/process");
const User = require("../models/user");

router.get("/", auth, async (req, res) => {
  res.send(req.user.solutions);
});

router.post("/", async (req, res) => {
  try {
    const process = await Process.findById(req.body.processId);
    const stages = process.stages;
    const indexParticipant = process.stages[
      req.body.step
    ].participant.findIndex((el) => el.email === req.body.email);
    stages[req.body.step].participant[indexParticipant] = {
      email: req.body.email,
      vote: req.body.vote,
      comment: req.body.comment,
    };
    await Process.findByIdAndUpdate(req.body.processId, {stages: stages});
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
