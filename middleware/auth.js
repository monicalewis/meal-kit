// Attaches req.user from session (non-blocking — always calls next)
function loadUser(req, res, next) {
  if (req.session && req.session.userId) {
    req.user = {
      id: req.session.userId,
      role: req.session.role || 'user'
    };
  } else {
    req.user = null;
  }
  next();
}

// Requires authentication — 401 if not logged in
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
  }
  next();
}

// Requires admin role — 403 if not admin
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required', code: 'ADMIN_REQUIRED' });
  }
  next();
}

module.exports = { loadUser, requireAuth, requireAdmin };
