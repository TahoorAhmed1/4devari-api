const controller = require("../../controllers/project-controllers/project.controller");

const projUrl = "/api/project";

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(`${projUrl}`, controller.addProject);

  app.get(`${projUrl}/points`, controller.getAllPoints);

  app.patch(`${projUrl}/:id`, controller.updateProject);

  app.delete(`${projUrl}/:id`, controller.deleteProject);

  app.get(`${projUrl}/user/:id`, controller.getAllProjectsOfUser);

  /* FEATURES - Start */
  app.post(`${projUrl}/features/:id`, controller.addFeaturesOfProject);

  app.get(`${projUrl}/features/:id`, controller.getFeaturesOfProject);

  app.patch(`${projUrl}/features/:id`, controller.updateFeaturesOfProject);
  /* FEATURES - End */

  app.get(`${projUrl}/:id`, controller.getProject);

  app.get(`${projUrl}`, controller.getAllProjects);
};
