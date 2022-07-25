const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    //res.send('Hey bitch');
    res.render('index')
})

module.exports = router;
