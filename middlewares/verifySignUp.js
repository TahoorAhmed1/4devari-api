const db = require('../models');
const User = db.User;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Email
  User.findOne({
    email: req.body.email,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (user) {
      res.status(400).send({ message: 'Email is already in use' });
      return;
    }

    // Username
    User.findOne({
      username: req.body.username,
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (user) {
        res.status(400).send({ message: 'Username is already taken' });
        return;
      }
      next();
    });
  });
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
};
module.exports = verifySignUp;
