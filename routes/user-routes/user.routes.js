const controller = require("../../controllers/user-controllers/user.controller");
const { authJwt } = require("../../middlewares");

const userUrl = "/api/user";

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(`${userUrl}/allAgencies`, controller.getAllAgencies);

  app.get(`${userUrl}/getAllUser`, controller.getAllUser);
  app.get(`${userUrl}/getAllAgent`, controller.getAllAgent);
  app.get(`${userUrl}/allStaff`, controller.getAllStaff);

  app.get(
    `${userUrl}/allStaffOfAgency/:agencyId`,
    controller.getAllStaffOfAgency
  );

  app.get(`${userUrl}/allBuilders`, controller.getAllBuilders);

  app.get(`${userUrl}/:userId`, controller.userProfile);

  app.patch(`${userUrl}/verifyUser`, controller.verifyUser);

  app.patch(
    `${userUrl}/changePassword/:userId`,
    [authJwt.verifyToken],
    controller.changePassword
  );

  app.patch(`${userUrl}/changeUserType`, controller.changeUserType);

  app.patch(
    `${userUrl}/:userId`,
    [authJwt.verifyToken],
    controller.updateUserData
  );

  app.get(
    `${userUrl}/sendForgotPasswordEmail/:email`,
    controller.sendForgotPasswordEmail
  );

  app.patch(
    `${userUrl}/resetPassword/:resetPasswordCode`,
    controller.changePasswordByForgotEmail
  );

  app.delete(
    `${userUrl}/:staffId/agency/:agencyId`,
    controller.deleteAgencyStaff
  );

  app.patch(
    `${userUrl}/search/:userId`,
    [authJwt.verifyToken],
    controller.updateUserSearch
  );
  app.get(
    `${userUrl}/likedProperties/:userId`,
    controller.getAllLikedPropertiesOfUser
  );
  app.get(
    `${userUrl}/likedProjects/:userId`,
    controller.getAllLikedProjectsOfUser
  );

  app.post(`${userUrl}/sendContactEmail`, controller.sendContactEmail);
};
