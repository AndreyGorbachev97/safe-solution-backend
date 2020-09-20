module.exports = function (req, res, next) {
  console.log('session', req.session);
  if (!req.session.isAuthenticated) {
    return res.send({ isAuthenticated: false });
  }
  next();
};
