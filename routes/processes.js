const {Router} = require('express');
const Process = require('../models/process');
const router = Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    const processes = await Process.find()
    res.send(processes);
});

router.get('/:id', auth, async (req, res) => {
    const process = await Process.findById(req.params.id);
    res.send(process);
});

router.post('/remove', async (req, res) => {
    try {
        await Process.deleteOne({_id: req.body.id})
        res.redirect('/processes')
    } catch (e) {
        console.log(e)
    }
});

module.exports = router;