const controller = require('../../controllers/analytic-controllers/event.controller');

const eventUrl = '/api/event';

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });


  app.post(`${eventUrl}/:userId`, controller.addEventOfUser);

  app.get(`${eventUrl}/:userId`, controller.getEventCountOfUser);

  app.get(`${eventUrl}/analytics/:userId`, controller.getEventsOfUser);
  app.get(`${eventUrl}/analytics/day/:userId`, controller.getEventsByPerDay);

//   app.delete(`${eventUrl}/user/:userId/inboxUser/:inboxUserId`, controller.deleteInboxChatOfUser);
};
