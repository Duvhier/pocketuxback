const getMozart = (req, res) => {
    res.send('API para Mozart');
  };

  const postMozart = (req, res) => {
    const datos = req.body
    res.send(datos);
  };

  
module.exports = {
    getMozart,
    postMozart
  };