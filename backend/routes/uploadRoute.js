const express = require('express');
const { upload } = require('../utils/fileUtils');
const { transcribeAndFormat } = require('../controllers/whisperController');

const router = express.Router();

router.post('/', upload.single('file'), transcribeAndFormat);

module.exports = router;
