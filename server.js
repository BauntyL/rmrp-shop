require("dotenv").config();
// app.js - главная точка входа для MasterHost с защитой от дубликатов
const path = require('path');
const fs = require('fs');

// Защита от множественных процессов
const lockFile = path.join(__dirname, '.process.lock');

try {
  // Проверяем существует ли файл блокировки
  if (fs.existsSync(lockFile)) {
    const lockData = fs.readFileSync(lockFile, 'utf8');
    const lockPid = parseInt(lockData);
    
    // Проверяем, жив ли процесс с этим PID
    try {
      process.kill(lockPid, 0); // Не убивает, просто проверяет
      console.log(`Процесс ${lockPid} уже запущен, завершаем дубликат`);
      process.exit(0);
    } catch (e) {
      // Процесс мертв, удаляем старый файл блокировки
      fs.unlinkSync(lockFile);
    }
  }
  
  // Создаем файл блокировки
  fs.writeFileSync(lockFile, process.pid.toString());
  
  // Удаляем файл блокировки при завершении
  process.on('exit', () => {
    try {
      fs.unlinkSync(lockFile);
    } catch (e) {}
  });
  
  process.on('SIGTERM', () => {
    try {
      fs.unlinkSync(lockFile);
    } catch (e) {}
    process.exit(0);
  });
  
} catch (error) {
  console.error('Ошибка при работе с файлом блокировки:', error);
}

// Установка переменных окружения
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 3000;

console.log(`Запуск приложения PID: ${process.pid}`);

// Запуск собранного приложения
require('./dist/server/index.js');
