const { MongoClient, ServerApiVersion } = require('mongodb');

// Configura tu conexión
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

async function crearCodigo(codigoData) {
  try {
    await client.connect();
    const database = client.db('ganacomoloco');
    const collection = database.collection('codigos');

    // Inserta el documento en la colección
    const result = await collection.insertOne({
      codigo: codigoData.codigo,
      email: codigoData.usuario,
      estado: codigoData.estado,
      premio: codigoData.premio,
      fechaIngreso: codigoData.fechaIngreso || new Date(),
    });

    console.log(`Código creado con el id: ${result.insertedId}`);
  } finally {
    await client.close();
  }
}

// Ejemplo de uso
crearCodigo({
  codigo: "001",
  email: "usuarioEjemplo",
  estado: "libre",
  premio: "premioEjemplo",
});
