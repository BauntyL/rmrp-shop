const winston = require('winston');

// Создаем логгер с базовой конфигурацией
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Безопасное логирование без чувствительных данных
const sanitizeData = (data) => {
  if (!data) return data;
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'secret'];
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

module.exports = {
  info: (message, data) => logger.info(message, sanitizeData(data)),
  error: (message, data) => logger.error(message, sanitizeData(data)),
  warn: (message, data) => logger.warn(message, sanitizeData(data)),
  debug: (message, data) => logger.debug(message, sanitizeData(data))
}; 