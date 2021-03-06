const { Router } = require("express");
const Process = require("../models/process");
const User = require("../models/user");
const Solution = require("../models/solution");
const router = Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const appDir = path.dirname(require.main.filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // '/files' это директория в которую будут сохранятся файлы
    cb(null, "files/");
  },
  filename: (req, file, cb) => {
    // Возьмем оригинальное название файла, и под этим же названием сохраним его на сервере
    const { originalname } = file;
    cb(null, originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/download", auth, async (req, res) => {
  const file = appDir + req.query.path;
  res.download(file);
});

router.get("/:id", auth, async (req, res) => {
  try {
    console.log('id:', req.params.id);
    const process = await Process.findById(req.params.id);
    console.log('process:', process);
    res.status(200);
    res.send(process);
  } catch (e) {
    res.send(e);
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const processes = await Process.find({ user: req.user.id });
    res.status(200);
    res.send(processes);
  } catch (e) {
    res.send(e);
  }
});

router.post("/addFile", upload.single("file"), async (req, res) => {
  res.json({ status: "Saved" });
});

router.post("/add", auth, async (req, res) => {
  try {
    const pathToDocument = `/files/${req.body.fileName}`;
    const process = new Process({
      result: "process",
      pathToDocument,
      pathToSheet: '',
      title: req.body.title,
      stages: req.body.stages,
      currentStep: 0,
      state: req.body.state,
      user: req.user,
      date: req.body.date,
    });
    process.save();
    //достаем участников 1го этапа и номера этапов в которых они учавствуют
    const participants = process.stages[0].participant.map((par) => ({
      ...par,
      step: 0,
    }));
    //добавляем в бд инф пользователям о том, что они учавствуют в процессе
    for (let i = 0; i < participants.length; i++) {
      const solution = new Solution({
        title: process.title,
        vote: "waiting",
        date: process.date,
        pathToDocument,
        author: { name: process.user.name, surname: process.user.surname, id: process.user._id },
        userId: participants[i].userId,
        processId: process.id,
        amount: process.stages.length,
        step: participants[i].step,
      });
      solution.save();
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
