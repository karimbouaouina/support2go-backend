require('dotenv').config();
const express = require('express');
const database = require('./database/db.config');
const authRoutes = require('./routes/auth'); 
const ticketRoutes = require('./routes/tickets');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

database.mongoose
  .connect(database.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to the database'))
  .catch(err => {
    console.error('Connection error', err);
    process.exit();
  });

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/', (req, res) => {
  res.send({ message: 'Hello, World!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
