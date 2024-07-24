const pool = require('../database/mongo')
const axios = require('axios');
const CryptoJS = require("crypto-js");
const moment = require('moment-timezone');



//---------------Login---------------------
const postLogin = async (req, res) => {
  const datos = req.body;
  //console.log("LOGIN: ", datos);
  const hashedPassword = CryptoJS.SHA256(datos.password, process.env.CODE_SECRET_DATA).toString();
  //console.log("PASSS: ", hashedPassword);
  try{
    const users =  await pool.db('pocketux').collection('users').find().toArray()
    console.log("USERS: ", users);
    const login =  await pool.db('pocketux').collection('users').findOne({ email: datos.email, password: hashedPassword });
    if (login) {
      // Obtener la fecha y hora actual en formato Bogotá
      const currentDateTime = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
      // Almacenar en la colección log_login
      await pool.db('pocketux').collection('log_login').insertOne({ email: datos.email, role: login.role, date: currentDateTime });
      res.json({ status: "Bienvenido", user: datos.email, role: login.role});
    } else {
      res.json({ status: "ErrorCredenciales" });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};


//------------- API para recibir de Make---------------------
const postMake = async (req, res) => {
  const datos = req.body;
  console.log("DATA: ", datos);  
  try{
    //const users =  await pool.db('pocketux').collection('users').find().toArray()    
    const registro =  await pool.db('pocketux').collection('make_responses').insertOne(datos);
    if (registro.acknowledged) {
      // Obtener la fecha y hora actual en formato Bogotá
      //const currentDateTime = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
      // Almacenar en la colección log_login
      //await pool.db('pocketux').collection('log_login').insertOne({ email: datos.email, role: login.role, date: currentDateTime });
      res.json({ status: "RegistroAlmacenado"});
      console.log("status: RegistroAlmacenado")
    } else {
      res.json({ status: "ErrorCreandoRegistro" });
      console.log("status: ErrorCreandoRegistro")
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};

//---------------API para recibir del cliente---------------------
const postClient = async (req, res) => {
  const datos = req.body;

  const { user, pass, request } = datos;

  try {
    // Buscar en la colección 'endpoints' si el usuario y la contraseña existen
    const endpoint = await pool.db('pocketux').collection('endpoints').findOne({ user: user, pass: pass });

    if (!endpoint) {
      res.status(401).send("Usuario no existe");
      return;
    }

    // Validar el estado del usuario
    if (endpoint.status !== "active") {
      res.status(403).send("Usuario Inactivo");
      return;
    }

    // Enviar el contenido del campo 'request' a la URL contenida en el campo 'url'
    const axios_url = endpoint.url;

    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    try {
      const response = await axios.post(axios_url, request, config);
      console.log('Respuesta del servidor:', response.data);
      res.send(response.data); // Enviar la respuesta de vuelta al cliente
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      res.status(500).send('Error al enviar la solicitud');
    }
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};



//---------------API para envio DEMO a MAKE---------------------
const postDemo = async (req, res) => {
  const datos = req.body;    

  // Obtener la fecha y hora actual en formato Bogotá
  const currentDateTime = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
  
  // Crear el objeto con la fecha y hora incluida
  const dataToSend = {
    date: currentDateTime,
    ...datos    
  };

  console.log("DATOS ENVIAR: ", dataToSend)

  const axios_url = "https://hook.us1.make.com/3uh3nnblj1j2ffrtyph9k9ldt19y03x9";
  //const dataToSend = datos.body;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 5000
  };

  try {
    const response = await axios.post(axios_url, dataToSend, config);
    console.log('Respuesta del servidor:', response.data);
    await pool.db('pocketux').collection('log_demo').insertOne(dataToSend);
    res.send(response.data); // Enviar la respuesta de vuelta al cliente
  } catch (error) {
    console.error('Error al enviar la solicitud:', error);
    res.status(500).send('Error al enviar la solicitud');
  }
};

module.exports = {
  postClient,
  postDemo,
  postLogin,
  postMake
};
