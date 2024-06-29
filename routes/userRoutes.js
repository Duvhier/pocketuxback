const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/mozart', userController.getMozart);
router.post('/mozart', userController.postMozart);
router.post('/demo', userController.postDemo);

module.exports = router;