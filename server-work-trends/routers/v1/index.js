const express = require('express');
const router = express.Router();

const user = require('./user');
const report = require('./report');

router.use('/users',user);
router.use('/reports',report);

module.exports = router;