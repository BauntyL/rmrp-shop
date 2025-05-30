const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const storage = require('./storage-fixed');  // ← ИСПРАВЛЕННЫЙ ИМПОРТ

function setupAuth(passport) {
  // Local Strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username, password, done) => {
      try {
        console.log(`🔐 Authenticating user: ${username}`);
        
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`❌ User not found: ${username}`);
          return done(null, false, { message: 'Неверное имя пользователя или пароль' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          console.log(`❌ Invalid password for user: ${username}`);
          return done(null, false, { message: 'Неверное имя пользователя или пароль' });
        }

        console.log(`✅ User authenticated: ${username}`);
        return done(null, user);
      } catch (error) {
        console.error('❌ Authentication error:', error);
        return done(error);
      }
    }
  ));

  // Serialize user
  passport.serializeUser((user, done) => {
    console.log(`🔧 Serializing user: ${user.username} (ID: ${user.id})`);
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      console.log(`🔧 Deserializing user ID: ${id}`);
      const user = await storage.getUserById(id);
      if (!user) {
        return done(null, false);
      }
      console.log(`✅ User deserialized: ${user.username}`);
      done(null, user);
    } catch (error) {
      console.error('❌ Deserialization error:', error);
      done(error);
    }
  });
}

module.exports = setupAuth;
