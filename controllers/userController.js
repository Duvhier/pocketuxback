const pool = require('../database/mongo'); 
const axios = require('axios');             
const CryptoJS = require("crypto-js");      
const moment = require('moment-timezone'); 
const express = require('express');       

// Ruta en tu servidor en Node.js (por ejemplo en Express)
const getGanadores = async (req, res) => {
  try {
      const codigos = await db.collection('codigos').find({ estado: { $ne: 'libre' } }).toArray();
      const ganadores = await Promise.all(
          codigos.map(async (codigo) => {
              const userInfo = await db.collection('log_login').findOne({ id_user: codigo.id_user });
              return {
                  fechaIngreso: codigo.fechaIngreso,
                  nombre: userInfo.nombre,
                  cedula: userInfo.cedula,
                  celular: userInfo.celular,
                  codigo: codigo.codigo,
                  premio: codigo.premio,
              };
          })
      );
      res.json(ganadores);
  } catch (error) {
      console.error('Error al obtener ganadores:', error);
      res.status(500).json({ message: 'Error al obtener ganadores' });
  }
};

//---------------API para recibir del cliente---------------------
const postClient = async (req, res) => {
  const { email, password, request } = req.body;

  try {
    const endpoint = await pool.db('ganacomoloco').collection('users').findOne({ email, password });

    if (!endpoint) {
      res.status(401).send("Usuario no existe");
      return;
    }

    // Verificar si el estado del usuario es activo
    if (endpoint.status !== "active") {
      res.status(403).send("Usuario Inactivo");
      return;
    }

    // Enviar el contenido de 'request' a la URL almacenada en 'endpoint.url'
    const axios_url = endpoint.url;
    const config = { headers: { 'Content-Type': 'application/json' }, timeout: 5000 };

    try {
      const response = await axios.post(axios_url, request, config);
      console.log('Respuesta del servidor:', response.data);
      res.send(response.data); 
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      res.status(500).send('Error al enviar la solicitud');
    }
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ status: "Error", message: "Error en el servidor" });
  }
};

// Ruta para registrar un código en VistaUsuario
const postVistaUsuario = async (req, res) => {
  const { codigo, email } = req.body;

  try {
    // Verificar si el código ya fue registrado
    const codigoExistente = await pool.db('ganacomoloco').collection('codigos').findOne({ codigo });
    if (codigoExistente) {
      return res.status(400).json({ mensaje: 'Código ya registrado' });
    }

    // Verificar si el código tiene premio
    let premio = null;
    const codigoInt = parseInt(codigo);
    if (codigoInt >= 0 && codigoInt <= 999) {
      if (codigoInt % 3 === 0) premio = 'Ganaste $10.000';
      else if (codigoInt % 5 === 0) premio = 'Ganaste $50.000';
      else if (codigoInt % 7 === 0) premio = 'Ganaste $1.000.000';
    }

    // Crear nuevo código con el estado y el premio
    const nuevoCodigo = {
      codigo,
      email,
      estado: premio ? 'Premiado' : 'Sin premio',
      premio,
      fechaIngreso: moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss')
    };

    // Insertar el nuevo código en la base de datos en la colección 'codigos'
    await pool.db('ganacomoloco').collection('codigos').insertOne(nuevoCodigo);

    // Responder al cliente
    res.json({ mensaje: 'Código registrado con éxito', codigo: nuevoCodigo });
  } catch (error) {
    console.error('Error al registrar el código:', error);
    res.status(500).json({ mensaje: 'Error al registrar el código' });
  }
};

//---------------Login---------------------
const postLogin = async (req, res) => {
  const { email, password } = req.body;

  // Encriptar la contraseña ingresada
  const hashedPassword = CryptoJS.SHA256(password, process.env.CODE_SECRET_DATA).toString();
  console.log("Contraseña encriptada: ", hashedPassword);

  try {
    // Buscar usuario en la base de datos
    const login = await pool.db('ganacomoloco').collection('users').findOne({ email, password: hashedPassword });

    if (login) {
      // Obtener la fecha y hora actual en formato Bogotá
      const currentDateTime = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');

      // Registrar en la colección log_login
      await pool.db('ganacomoloco').collection('log_login').insertOne({ email, role: login.role, date: currentDateTime });

      // Respuesta al cliente
      res.json({ status: "Bienvenido", user: email, role: login.role });
    } else {
      res.json({ status: "ErrorCredenciales" });
    }
  } catch (error) {
    console.error('Error al buscar el usuario:', error);
    res.status(500).json({ status: "Error", message: "Error en el servidor" });
  }
};

//---------------Registro---------------------
const postRegistro = async (req, res) => {
  const { nombre, fechaNacimiento, cedula, celular, email, ciudad, password } = req.body;

  try {
    // Verificar si el correo ya está registrado
    const existingUser = await pool.db('ganacomoloco').collection('users').findOne({ email });

    if (existingUser) {
      return res.status(400).json({ status: "Error", message: "El correo ya está registrado" });
    }

    // Encriptar la contraseña
    const hashedPassword = CryptoJS.SHA256(password, process.env.CODE_SECRET_DATA).toString();

    // Crear un nuevo usuario
    const nuevoUsuario = {
      nombre,
      fechaNacimiento,
      cedula,
      celular,
      email,
      ciudad,
      password: hashedPassword,
      role: "user", 
      createdAt: moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss')
    };

    // Insertar el nuevo usuario en la colección 'users'
    await pool.db('ganacomoloco').collection('users').insertOne(nuevoUsuario);

    // Registrar en la colección log_login
    await pool.db('ganacomoloco').collection('log_login').insertOne({
      email,
      role: "user",  // Rol de usuario
      date: moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss')
    });

    // Respuesta al cliente
    res.json({ status: "UsuarioCreado", message: "Registro exitoso" });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ status: "Error", message: "Error en el servidor" });
  }
};

const getCodigos = async (req, res) => {
  const { email } = req.params;
  try {
    const codigos = await pool.db('ganacomoloco').collection('codigos').find({ email }).toArray();
    res.json(codigos);
  } catch (error) {
    console.error('Error al obtener códigos:', error);
    res.status(500).json({ message: 'Error al obtener códigos' });
  }
};

const postCodigo = async (req, res) => {
  const { codigo, email, estado, premio, fechaIngreso } = req.body;
  try {
    const nuevoCodigo = { codigo, email, estado, premio, fechaIngreso };
    await pool.db('ganacomoloco').collection('codigos').insertOne(nuevoCodigo);
    res.json({ message: 'Código registrado con éxito', codigo: nuevoCodigo });
  } catch (error) {
    console.error('Error al registrar el código:', error);
    res.status(500).json({ message: 'Error al registrar el código' });
  }
};

module.exports = {
  postClient,
  postLogin,
  postRegistro,
  postVistaUsuario,
  getGanadores,
  getCodigos,
  postCodigo,
}; 