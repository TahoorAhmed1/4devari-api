const controller = require('../../controllers/inbox-controllers/inbox.controller');

const inboxUrl = '/api/inbox';

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });


  app.post(`${inboxUrl}/sendMessage`, controller.sendMessage);

  app.get(`${inboxUrl}/chats/user/:userId`, controller.getAllChatsOfUser);

  app.get(
    `${inboxUrl}/chats/messagesByChatId/:chatId`,
    controller.getChatMessagesByChatId
  );


  app.get(`${inboxUrl}/chats/messagesByUserIds`,
    controller.getChatsMessagesByUserIds
  );

  app.get(
    `${inboxUrl}/chats/inboxByUserId/:userId`,
    controller.getUserInbox
  );

  app.post(`${inboxUrl}/createInbox`, controller.createInbox);

  app.delete(`${inboxUrl}/user/:userId/inboxUser/:inboxUserId`, controller.deleteInboxChatOfUser);
};
