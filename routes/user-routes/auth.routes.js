const controller = require('../../controllers/user-controllers/auth.controller');
const { verifySignUp } = require('../../middlewares');
const passport = require('passport');
var jwt = require('jsonwebtoken');
const config = require('../../config/auth.config');



const authUrl = '/api/auth';
// Frontend Redirect url
const url = process.env.NODE_ENV === 'dev' ? 'http://localhost:3000' : process.env.FRONTEND_BASE_URL || 'http://localhost:8080'; 

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    `${authUrl}/signUp`,
    [verifySignUp.checkDuplicateUsernameOrEmail],
    controller.signUp
  );

  app.get(`${authUrl}/facebook`, passport.authenticate('facebook'));

  app.get(
    '/api/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureMessage: 'Sorry, something went wrong',
    }),
    function (req, res) {
      // Successful authentication
      // var token = jwt.sign({ id: profile.id }, config.secret, {
      //   expiresIn: 86400, // 24 hours
      // });
      // res.send({
      //   message: 'User signed in via Facebook successfully',
      //   user: req.user,
      // });
      // return;
      const { social_user_id, name, registration_type, _id } = req.user;
      var token = jwt.sign({ id: social_user_id }, config.secret, {
        expiresIn: 86400, // 24 hours
      });
      return res.redirect(
        `${url}/?social_user_id=${social_user_id}&username=${name}&userId=${_id}&registration_type=${registration_type}&accessToken=${token}`
      );
    }
  );

  app.get(
    `${authUrl}/google`,
    passport.authenticate('google', { scope: ['profile'] })
  );

  app.get(
    '/api/auth/google/callback',
    passport.authenticate('google', {
      failureMessage: 'Sorry, something went wrong',
    }),
    function (req, res) {
      // Successful authentication
      const { social_user_id, name, registration_type, _id } = req.user;
      var token = jwt.sign({ id: social_user_id }, config.secret, {
        expiresIn: 86400, // 24 hours
      });
      // res.send({
      //   message: 'User signed in via Google successfully',
      //   user: req.user,
      // });
      // return;

      return res.redirect(
        `${url}/?social_user_id=${social_user_id}&username=${name}&userId=${_id}&registration_type=${registration_type}&accessToken=${token}`
      );
    }
  );

  app.get(`${authUrl}/signInByUsername`, controller.signInByUsername);

  app.get(`${authUrl}/signInByEmail`, controller.signInByEmail);
};
