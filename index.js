const express = require('express');
const cors = require('cors');
const pool = require('./database/mongo');
require('dotenv').config();
const app = express();
const port = process.env.PORT;

app.use(cors()); // Permitir todos los orígenes
app.use(express.json());

//connectToDatabase();

/* app.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const users = await usersCollection.find().toArray();
    console.log('Fetched users from MongoDB:', users);
    res.send(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Failed to fetch users from MongoDB');
  }
}); */

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


