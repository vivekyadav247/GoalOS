const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const monthRoutes = require('./routes/monthRoutes');
const weekRoutes = require('./routes/weekRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/months', monthRoutes);
app.use('/api/weeks', weekRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'GoalOS API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

