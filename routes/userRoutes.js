const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas existentes
router.post('/login', userController.postLogin); 
router.post('/registro', userController.postRegistro);
router.post('/vistausuario', userController.postVistaUsuario);
router.get('/api/ganadores', userController.getGanadores);

// Nuevas rutas para manejar los códigos
router.get('/api/codigos/:email', userController.getCodigos); // Obtener códigos por usuario
router.post('/api/codigos', userController.postCodigo); // Registrar un nuevo código

module.exports = router;
