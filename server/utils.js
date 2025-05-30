function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Пароль должен содержать минимум ${minLength} символов`);
  }
  if (!hasUpperCase) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву');
  }
  if (!hasLowerCase) {
    errors.push('Пароль должен содержать хотя бы одну строчную букву');
  }
  if (!hasNumbers) {
    errors.push('Пароль должен содержать хотя бы одну цифру');
  }
  if (!hasSpecialChar) {
    errors.push('Пароль должен содержать хотя бы один специальный символ');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validatePassword
}; 