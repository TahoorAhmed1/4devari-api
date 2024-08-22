const controller = require('../../controllers/subscription-controllers/subscription.controller');

const subscriptionUrl = '/api/subscription';

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.get(
    `${subscriptionUrl}`,
    controller.getAllSubscriptions
  );
  app.post(`${subscriptionUrl}`, controller.createSubscription);
  app.delete(`${subscriptionUrl}/:subscriptionId`, controller.deleteSubscription);
};
