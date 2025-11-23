 const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const { MONGO_URI } = require('./config/env');
const { PORT } = require('./config/env');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const categoryRoutes = require('./routes/category.routes');
const tagRoutes = require('./routes/tag.routes');
const commentRoutes = require('./routes/comment.routes');
const dailyMetricRoutes = require('./routes/dailyMetric.routes');
const blogSettingsRoutes = require('./routes/blogSettings.routes');
const errorLogger = require('./middleware/errorLogger');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const swaggerDocument = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));

require('./config/passport');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// API Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api', commentRoutes);
app.use('/api', dailyMetricRoutes); // Mounts metrics routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/settings', blogSettingsRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 Handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.code = 'NOT_FOUND';
  error.status = 404;
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(status).json({
    message,
    code,
  });
});

// Error logging middleware (must be after routes)
app.use(errorLogger);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // If startup fails, log and exit
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

 startServer();

 module.exports = app;
