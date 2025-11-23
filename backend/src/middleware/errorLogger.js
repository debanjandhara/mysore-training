const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', '..', 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'app.log');

const errorLogger = (err, req, res, next) => {
  const logEntry = `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${err.message}\n`;
  fs.appendFile(logFilePath, logEntry, () => {});
  next(err);
};

module.exports = errorLogger;
