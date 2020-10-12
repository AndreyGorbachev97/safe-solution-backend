const {Router} = require('express');
const Process = require('../models/process');
const auth = require('../middleware/auth');

const router = Router();

router.post('/', auth, async (req, res) => {
    const process = new Process({
       title: req.body.title,
       stages: req.body.stages,
       state: req.body.state,
       userId: req.user,
    });
    try {
        process.save();
        res.status(200);
        res.send(process);
    } catch (e) {
        console.log(e)
    }
});

module.exports = router;

