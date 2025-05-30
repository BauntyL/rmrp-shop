import bcrypt from 'bcrypt';

const password = 'Lqlcpyvb555!999#81';
const hash = await bcrypt.hash(password, 10);
console.log('Хеш пароля:', hash); 