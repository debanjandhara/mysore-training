const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userRepository = require('../repositories/user.repository');
const { 
  JWT_SECRET, 
  GOOGLE_CLIENT_ID, 
  GOOGLE_CLIENT_SECRET, 
  GOOGLE_CALLBACK_URL 
} = require('./env');

// JWT Strategy Configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await userRepository.findById(payload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google Strategy Configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with this googleId
        let user = await userRepository.findByGoogleId(profile.id);

        if (user) {
          return done(null, user);
        }

        // Check if user exists with the same email (merge accounts logic optional, but safer to just fail or link)
        // For simplicity here, if email exists but no googleId, we'll update the user to add googleId
        // Or we just create a new user. Let's check email.
        const email = profile.emails[0].value;
        user = await userRepository.findByEmail(email);

        if (user) {
          user.googleId = profile.id;
          user.profileImage = user.profileImage || profile.photos[0]?.value;
          await userRepository.saveUser(user);
          return done(null, user);
        }

        // Create new user
        user = await userRepository.createUser({
          name: profile.displayName,
          email: email,
          googleId: profile.id,
          profileImage: profile.photos[0]?.value,
        });

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

module.exports = passport;
