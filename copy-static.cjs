const fs = require('fs');
const path = require('path');

// Путь к index.html в корне клиента
const source = path.resolve(__dirname, 'client', 'index.html');

// Папка назначения после сборки
const destination = path.resolve(__dirname, 'dist', 'client', 'index.html');

fs.copyFile(source, destination, (err) => {
  if (err) {
    console.error('❌ Ошибка при копировании index.html:', err);
  } else {
    console.log('✅ Файл index.html успешно скопирован в dist/client');
  }
});
