const controller = require('../../controllers/admin-controllers/user.admin.controller');
const userController = require('../../controllers/user-controllers/user.controller');
const { verifyToken, isAdmin } = require('../../middlewares/authJwt');

const adminUrl = '/api/admin/user';

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.get(`${adminUrl}/all`, controller.getAllUsers);
  // app.get(`${adminUrl}/all`, verifyToken, isAdmin, controller.getAllUsers);

  app.patch(`${adminUrl}/makeUserTypeAdmin`, controller.makeUserTypeAdmin);

  app.patch(
    `${adminUrl}/verifyUserWithoutCode/:userId`,
    controller.verifyUserWithoutCode
  );

  app.delete(
    `${adminUrl}/:userId`,
    verifyToken, 
    isAdmin,
    userController.deleteUser
  );
};
