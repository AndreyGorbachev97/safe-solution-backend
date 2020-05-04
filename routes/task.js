const {Router} = require('express');
const Process = require('../models/process');
const auth = require('../middleware/auth');

const router = Router();

router.post('/add', auth, async (req, res) => {
    console.log(req.body);
    const process = await Process.findById(req.body.process.id);
    await req.user.addToTask(req.body.decision, process);
});

module.exports = router;

