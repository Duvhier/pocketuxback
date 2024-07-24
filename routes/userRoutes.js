const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/client', userController.postClient); //API para ejecutar tiffany desde cliente
router.post('/demo', userController.postDemo); //Ejecuta el demo desde el front
router.post('/login', userController.postLogin); //Valida el user y pass del front
router.post('/make', userController.postMake); //Respuesta de Make hacia PocketUX

module.exports = router;