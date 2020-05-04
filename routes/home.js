const {Router} = require('express');
const router = Router();

router.get('/', (req, res) => {
    res.status(200);
    res.send('hello api');
});

module.exports = router;