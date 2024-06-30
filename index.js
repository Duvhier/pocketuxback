const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;

app.use(cors()); // Permitir todos los orígenes
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Bienvenido a PocketUX!');
  });

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});