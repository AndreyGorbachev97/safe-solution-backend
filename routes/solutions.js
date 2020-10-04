const { Router } = require("express");
const router = Router();
const auth = require("../middleware/auth");
const Process = require("../models/process");
const User = require("../models/user");

const determinantOfStatus = (stage) => {
  const waiting = stage.participant.find((el) => el.vote === "waiting");
  if (waiting) return "inWork";
  const agree = stage.participant.filter((el) => el.vote === "За").length;
  // процент давших ответ "За"
  const percentageOfConsonants = (agree * 100) / stage.participant.length;
  if (percentageOfConsonants >= stage.percentageVotes) return "success";
  return "notSuccess";
};

router.get("/", auth, async (req, res) => {
  res.send(req.user.solutions);
});

router.post("/", auth, async (req, res) => {
  try {
    const process = await Process.findById(req.body.processId);
    const stages = process.stages;
    const indexParticipant = process.stages[
      req.body.step
    ].participant.findIndex((el) => el.email === req.body.email);
    //внос голоса на этап
    stages[req.body.step].participant[indexParticipant] = {
      email: req.body.email,
      vote: req.body.vote,
      comment: req.body.comment,
    };
    //смена статуса этапа
    const statusStage = determinantOfStatus(stages[req.body.step]);
    stages[req.body.step].status = statusStage;
    if (stages[req.body.step + 1] && statusStage === "success")
      stages[req.body.step + 1].status = "inWork";
    //сохранение изменений
    await Process.findByIdAndUpdate(req.body.processId, { stages: stages });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
