const express = require('express');
const router = express.Router();

const api_v1 = require('./v1');

router.use('/api/v1',api_v1);

module.exports = router;
