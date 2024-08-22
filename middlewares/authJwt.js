const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models');
const User = db.User;

verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send({ message: 'No token provided' });
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user.type === 'admin') {
      next();
      return;
    }
    res.status(403).send({ message: 'Restricted; for Admin only' });
    return;
  });
};

isAgency = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user.type === 'agency') {
      next();
      return;
    }
    res.status(403).send({ message: 'Restricted; for Agency only' });
    return;
  });
};

isStaff = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user.type === 'staff' || user.type === 'agency') {
      next();
      return;
    }
    res.status(403).send({ message: 'Restricted; for Agency and Staff only' });
    return;
  });
};

isBuilder = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user.type === 'builder') {
      next();
      return;
    }
    res.status(403).send({ message: 'Restricted; for Builder only' });
    return;
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isAgency,
  isBuilder,
  isStaff
};

module.exports = authJwt;
