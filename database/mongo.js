const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGO_URI
//const uri = 'mongodb+srv://duviertavera01:d0pOG5VReS6RWhtL@cluster0.6mdjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

const validatedb = async  () => {
    try {
      await  client.connect()
      console.log('Conexión exitosa a MongoDB');
    } catch (error) {
      console.error('Error al conectar con MongoDB', error);
    }
}


validatedb()


module.exports = client;

