const passport = require('passport');

const authenticateJwt = (req, res, next) => {
  const middleware = passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      console.error('[auth.authenticateJwt] Error in passport callback:', err);
      return next(err);
    }

    if (!user) {
      console.warn('[auth.authenticateJwt] Unauthorized request:', {
        path: req.path,
        method: req.method,
        authHeaderPresent: Boolean(req.headers['authorization']),
      });
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    req.user = user;
    req.token = token;

    console.log('[auth.authenticateJwt] Authenticated user:', {
      id: user._id?.toString?.() || user.id,
      role: user.role,
      path: req.path,
      method: req.method,
    });

    next();
  });

  middleware(req, res, next);
};

module.exports = {
  authenticateJwt,
};
