const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/client', userController.postClient);
router.post('/demo', userController.postDemo);
router.post('/login', userController.postLogin);
router.post('/make', userController.postMake);

module.exports = router;