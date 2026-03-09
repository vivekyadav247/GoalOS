const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { clerkMiddleware } = require('@clerk/express');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS + Clerk/JSON middleware
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware());

const resolveClerkUserId = (req) => {
  if (!req) {
    return null;
  }

  // If another middleware already set object-form auth, reuse it.
  if (req.auth && typeof req.auth === 'object' && req.auth.userId) {
    return req.auth.userId;
  }

  // @clerk/express provides req.auth() function by default.
  if (typeof req.auth === 'function') {
    try {
      const authState = req.auth();
      return authState?.userId || null;
    } catch (_error) {
      return null;
    }
  }

  return null;
};

const requireApiAuth = (req, res, next) => {
  const userId = resolveClerkUserId(req);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  // Normalize auth shape for controllers expecting req.auth.userId.
  req.auth = { userId };
  return next();
};

// Database
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const monthRoutes = require('./routes/monthRoutes');
const weekRoutes = require('./routes/weekRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Public auth endpoints (legacy/local auth if still used)
app.use('/api/auth', authRoutes);

// Protected planner APIs (Clerk)
app.use('/api/goals', requireApiAuth, goalRoutes);
app.use('/api/months', requireApiAuth, monthRoutes);
app.use('/api/weeks', requireApiAuth, weekRoutes);
app.use('/api/tasks', requireApiAuth, taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'GoalOS API is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled API error:', err?.message || err);

  if (res.headersSent) {
    return next(err);
  }

  const status = Number(err?.status || err?.statusCode) || 500;
  const message = status >= 500 ? 'Server error' : (err?.message || 'Request failed');

  return res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`GoalOS API listening on port ${PORT}`);
});

