const { Router } = require("express");
const router = Router();
const auth = require("../middleware/auth");
const Process = require("../models/process");
const User = require("../models/user");
const Solution = require("../models/solution");

const determinantOfStatus = (stage) => {
  const waiting = stage.participant.find((el) => el.vote === "waiting");
  if (waiting) return "inWork";
  const agree = stage.participant.filter((el) => el.vote === "approve").length;
  // процент давших ответ "За"
  const percentageOfConsonants = (agree * 100) / stage.participant.length;
  if (percentageOfConsonants >= stage.percentageVotes) return "success";
  return "notSuccess";
};

router.get("/", async (req, res) => {
  try {
    const solutions = await Solution.find({ userId: req.user.id });
    console.log(solutions);
    res.status(200);
    res.send(solutions);
  } catch (e) {
    res.send(e);
  }
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
    await Solution.findByIdAndUpdate(req.body.id, { vote: req.body.vote });
    await Process.findByIdAndUpdate(req.body.processId, { stages: stages });
    res.status(200);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
