const axios = require('axios');

const getMozart = (req, res) => {
  res.send('API para Mozart');
};

const postLogin = async (req, res) => {
  const datos = req.body;
  console.log("LOGIN: ", datos);

  let user = "feliperodriguezjar@gmail.com";
  let pass = "admin";

  if (datos.email === user && datos.password === pass) {
    res.json({ status: "Bienvenido", user: datos.email, role: "admin"});
  } else {
    res.json({ status: "Error" });
  }
};



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

const postDemo = async (req, res) => {
  const datos = req.body;    
  console.log("DATOS: ", datos)

  const axios_url = "https://hook.us1.make.com/3uh3nnblj1j2ffrtyph9k9ldt19y03x9";
  const dataToSend = datos.body;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 5000
  };

  try {
    const response = await axios.post(axios_url, dataToSend, config);
    console.log('Respuesta del servidor:', response.data);
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
  postLogin
};
