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
  const modStages = req.body.stages.map((el) => ({
    participant: el.participant.map((par) => ({ email: par, vote: "waiting" })),
  }));
  const process = new Process({
    result: "process",
    title: req.body.title,
    stages: modStages,
    state: req.body.state,
    userId: req.user,
    date: req.body.date,
  });
  try {
    process.save();
    await req.user.addToProcess(process);
    //достаем всех участников и номера этопов в которых они учавствуют
    const participants = process.stages.reduce(
      (acc, el, i) => [
        ...acc,
        ...el.participant.map((par) => ({ par, step: i + 1 })),
      ],
      []
    );
    //добавляем в бд инф пользователям о том, что они учавствуют в процессе
    for (let i = 0; i < participants.length; i++) {
      const currentUser = await User.findOne({ email: participants[i].email });
      await currentUser.addToSolutions({
        title: process.title,
        vote: "waiting",
        date: process.date,
        stage: {
          amount: process.stages.length,
          status: "progress",
          step: participants[i].step,
        },
      });
    }

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
