const pool = require('../database/mongo')
const axios = require('axios');
const CryptoJS = require("crypto-js");
const moment = require('moment-timezone');


const getMozart = (req, res) => {
  res.send('API para Mozart');
};


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

//---------------API para recibir Mozart---------------------
const postMozart = async (req, res) => {
  const datos = req.body;

  let user = "jmosquera@mozart.co";
  let pass = "1234567";

  if (datos.username === user && datos.password === pass) {
    
    const axios_url = "https://hook.us1.make.com/7jwrztb8acl3bs3sox4dxtc25922z5hb";

    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    const dataToSend = datos.body;

    try {
      const response = await axios.post(axios_url, dataToSend, config);
      console.log('Respuesta del servidor:', response.data);
      res.send(response.data); // Enviar la respuesta de vuelta al cliente
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      res.status(500).send('Error al enviar la solicitud');
    }
  } else {
    res.status(401).send("ERROR TOKEN");
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
  getMozart,
  postMozart,
  postDemo,
  postLogin,
  postMake
};
