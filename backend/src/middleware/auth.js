const passport = require('passport');

const authenticateJwt = (req, res, next) => {
  const middleware = passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    req.user = user;
    req.token = token;

    next();
  });

  middleware(req, res, next);
};

module.exports = {
  authenticateJwt,
};
