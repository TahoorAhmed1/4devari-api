const controller = require('../../controllers/property-controllers/property.controller');

const propUrl = '/api/property';

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(`${propUrl}`, controller.addProperty);

  app.patch(`${propUrl}/:id`, controller.updateProperty);

  app.delete(`${propUrl}/:id`, controller.deleteProperty);

  app.get(`${propUrl}/points`, controller.getAllPoints);

  app.get(`${propUrl}/residential`, controller.getAllResidentialProperties);

  app.get(`${propUrl}/commercial`, controller.getAllCommercialProperties);

  app.get(`${propUrl}/plot`, controller.getAllPlotProperties);

  app.get(`${propUrl}/coliving`, controller.getAllColivingSpaceProperties);

  app.get(`${propUrl}/coworking`, controller.getAllCoworkingSpaceProperties);

  // User Properties
  app.get(`${propUrl}/user/:id`, controller.getAllPropertiesOfUser);
  app.get(`${propUrl}/user/:id/residential`, controller.getAllResPropertiesOfUser);
  app.get(`${propUrl}/user/:id/commercial`, controller.getAllComPropertiesOfUser);
  app.get(`${propUrl}/user/:id/plot`, controller.getAllPlotPropertiesOfUser);
  app.get(`${propUrl}/user/:id/coliving`, controller.getAllCoLivingPropertiesOfUser);
  app.get(`${propUrl}/user/:id/coworking`, controller.getAllCoWorkingPropertiesOfUser);

  /* FEATURES APIS ENDPOINTS (Start) */
  app.post(`${propUrl}/features/:id`, controller.addFeaturesOfProperty);

  app.get(`${propUrl}/features/:id`, controller.getFeaturesOfProperty);

  app.patch(`${propUrl}/features/:id`, controller.updateFeaturesOfProperty);
  /* FEATURES APIS ENDPOINTS (End) */

  app.get(`${propUrl}/:id`, controller.getProperty);

  app.get(`${propUrl}`, controller.getAllProperties);

};
