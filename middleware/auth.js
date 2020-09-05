const jwt = require("jsonwebtoken");
const { JWT_SCRET } = require("../keys");

module.exports = function (req, res, next) {
  // const authHeader = req.get('Authorization');

  // if(!authHeader) {
  //   res.status(401).json({message: 'token not provided!'});
  // }
  // res.send({message: 'token true'})
  if (!req.session.isAuthenticated) {
    return res.send({ isAuthenticated: false });
  }
  next();
};
