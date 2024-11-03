const CryptoJS = require('crypto-js');

const hashPassword = (password) => {
  return CryptoJS.SHA256(password, process.env.CODE_SECRET_DATA).toString();
};

module.exports = {
  hashPassword
};
