const { Router } = require("express");
const Process = require("../models/process");
const User = require("../models/user");
const router = Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const appDir = path.dirname(require.main.filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // '/files' это директория в которую будут сохранятся файлы
    cb(null, "dist/files/");
  },
  filename: (req, file, cb) => {
    // Возьмем оригинальное название файла, и под этим же названием сохраним его на сервере
    const { originalname } = file;
    cb(null, originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/", auth, async (req, res) => {
  try {
    const processes = [];
    for (let i = 0; i < req.user.processes.length; i++) {
      const process = await Process.findById(req.user.processes[i]._id);
      processes.push(process);
    }
    res.send(processes);
  } catch (e) {
    console.log(e);
  }
});

router.get("/download", auth, async (req, res) => {
  console.log("path: ", req.query);
  const file = appDir + req.query.path;
  console.log("file", file);
  res.download(file);
});

router.post("/addFile", upload.single("file"), async (req, res) => {
  res.json({ status: "Saved" });
});

router.get("/:id", auth, async (req, res) => {
  const process = await Process.findById(req.params.id);
  res.send(process);
});

router.post("/add", auth, async (req, res) => {
  const pathToDocument = `/dist/files/${req.body.fileName}`;
  const process = new Process({
    result: "process",
    pathToDocument,
    title: req.body.title,
    stages: req.body.stages,
    currentStep: 0,
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
        ...el.participant.map((par) => ({ ...par, step: i + 1, status: el.status })),
      ],
      []
    );
    console.log("participants", participants);
    //добавляем в бд инф пользователям о том, что они учавствуют в процессе
    for (let i = 0; i < participants.length; i++) {
      console.log("email", participants[i].email);
      const currentUser = await User.findOne({ email: participants[i].email });
      console.log("currentUser", currentUser);
      await currentUser.addToSolutions({
        title: process.title,
        vote: "waiting",
        date: process.date,
        pathToDocument,
        processId: process.id,
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
