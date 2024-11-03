const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI; 
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

// Función para agregar un usuario
async function crearUsuario(usuarioData) {
  try {
    await client.connect();
    const database = client.db('ganacomoloco');
    const collection = database.collection('users');

    // Definir el documento del usuario según la estructura deseada
    const nuevoUsuario = {
      nombre: usuarioData.nombre,
      fechaNacimiento: usuarioData.fechaNacimiento,
      tipoDocumento: usuarioData.tipoDocumento,
      numeroDocumento: usuarioData.numeroDocumento,
      correo: usuarioData.correo,
      numeroCelular: usuarioData.numeroCelular,
      departamento: usuarioData.departamento,
      ciudad: usuarioData.ciudad,
      contraseña: usuarioData.contraseña,
      fechaRegistro: new Date()
    };

    // Intentar insertar el usuario y manejar errores de duplicado
    try {
      const result = await collection.insertOne(nuevoUsuario);
      console.log(`Usuario creado con el id: ${result.insertedId}`);
    } catch (error) {
      if (error.code === 11000) {
        console.error("Error: El número de documento o el correo ya están registrados.");
      } else {
        console.error("Error al crear el usuario:", error);
      }
    }

  } finally {
    await client.close();
  }
}

// Ejemplo de uso
crearUsuario({
  nombre: "Juan Perez",
  fechaNacimiento: "1990-01-01",
  tipoDocumento: "Cédula",
  numeroDocumento: "1234567890",
  correo: "juan.perez@example.com",
  numeroCelular: "3001234567",
  departamento: "Antioquia",
  ciudad: "Medellín",
  contraseña: "password123"
});
