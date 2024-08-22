const db = require('../../models');
const { Chat, Inbox } = db;

const common = require('../../config/common.config');

/* ==================================================== SEND MESSAGE ==================================================== */
exports.sendMessage = async (req, res) => {
  const [senderInbox, senderInboxErr] = await common.p2r(
    Inbox.findOne({ user: req.body.sender })
  );

  if (senderInboxErr) {
    res.status(500).send({
      message: 'An error occurred while finding sender inbox',
      error: senderInboxErr,
    });
    return;
  }

  if (!senderInbox) {
    res.status(404).send({
      message: 'An inbox does not exist for sender',
    });
    return;
  }

  

  const [receiverInbox, receiverInboxErr] = await common.p2r(
    Inbox.findOne({ user: req.body.receiver })
  );

  if (receiverInboxErr) {
    res.status(500).send({
      message: 'An error occurred while finding receiver inbox',
      error: receiverInboxErr,
    });
    return;
  }

  if (!receiverInbox) {
    res.status(404).send({
      message: 'An inbox does not exist for receiver',
    });
    return;
  }


  const [existingChat, existingChatErr] = await common.p2r(
    Chat.findOne({ members: { $all: [req.body.sender, req.body.receiver] } })
  );

  if (existingChatErr) {
    res.status(500).send({
      message: 'An error occurred while finding chat',
      error: existingChatErr,
    });
    return;
  }

  if (!existingChat) {
    const newChat = new Chat({
      subject: req.body.subject,
      messages: [
        {
          sender: req.body.sender,
          timestamp: req.body.timestamp,
          message: req.body.message,
        },
      ],
      members: [req.body.sender, req.body.receiver],
      referencePrperties: req.body?.referencePrperties ? [req.body?.referencePrperties] : [],
      referenceProjects: req.body?.referenceProjects ? [req.body?.referenceProjects] : [],
    });

    const [savedChat, savedChatErr] = await common.p2r(newChat.save());

    if (savedChatErr) {
      res.status(500).send({
        message: 'An error occurred while saving chat',
        error: savedChatErr,
      });
      return;
    }

    if (!savedChat) {
      res.status(500).send({
        message: 'Chat not saved',
        error: savedChatErr,
      });
      return;
    }
  } else {
    existingChat.messages = existingChat.messages.concat({
      sender: req.body.sender,
      timestamp: req.body.timestamp,
      message: req.body.message,
    });
    if(req?.body?.referencePrperties){
      existingChat.referencePrperties.push(req.body.referencePrperties)
    }
    if(req?.body?.referenceProjects){
      existingChat.referenceProjects.push(req.body.referenceProjects)
    }

    const [savedChat, savedChatErr] = await common.p2r(existingChat.save());

    if (savedChatErr) {
      res.status(500).send({
        message: 'An error occurred while saving chat',
        error: savedChatErr,
      });
      return;
    }

    if (!savedChat) {
      res.status(500).send({
        message: 'Chat not saved',
        error: savedChatErr,
      });
      return;
    }
  }

  // Adding user in inbox

  if(!senderInbox.inboxUsers.find(id => id.equals(req.body.receiver))){
    senderInbox.inboxUsers.push(req.body.receiver);
    senderInbox.save();
  }
  if(!receiverInbox.inboxUsers.find(id => id.equals(req.body.sender))){
    receiverInbox.inboxUsers.push(req.body.sender);
    receiverInbox.save();
  }
  

  res.status(200).send({ message: 'Message sent successfully' });
  return;
};

/* ==================================================== GET CHATS OF USER ==================================================== */
exports.getAllChatsOfUser = async (req, res) => {
  const [chats, chatsErr] = await common.p2r(
    Chat.find({ members: { $in: [req.params.userId]} }).populate({
      path: 'members',
      model: 'User',
      select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1, 'landlineNumber': 1, 'picture': 1, 'mobileNumbers': 1, 'whatsapp': 1}
    })
  );

  if (chatsErr) {
    res.status(500).send({
      message: 'An error occurred while getting chats of user',
      error: chatsErr,
    });
    return;
  }

  if (!chats) {
    res.status(404).send({
      message: 'No chats found',
    });
    return;
  }

  res.status(200).send(chats);
  return;
};

/* ==================================================== GET CHAT MESSAGES BY CHAT ID ==================================================== */
exports.getChatMessagesByChatId = async (req, res) => {
  const [chat, chatErr] = await common.p2r(Chat.findById(req.params.chatId).populate({
    path: 'messages.sender',
    model: 'User',
    select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'picture': 1, 'mobileNumbers': 1, 'landlineNumber': 1,}
  }).populate({
    path: 'members',
    model: 'User',
    select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'picture': 1, 'mobileNumbers': 1, 'landlineNumber': 1,}
  }));

  if (chatErr) {
    res.status(500).send({
      message: 'An error occurred while getting chat messages',
      error: chatErr,
    });
    return;
  }

  if (!chat) {
    res.status(404).send({
      message: 'No chat found',
    });
    return;
  }

  res.status(200).send(chat);
  return;
};

/* ==================================================== GET CHAT MESSAGES BY USER IDS ==================================================== */
exports.getChatsMessagesByUserIds = async (req, res) => {
  const [chat, chatErr] = await common.p2r(
    Chat.findOne({ members: { $all: [req.query.user1, req.query.user2] } }).populate({
      path: 'messages.sender',
      model: 'User',
      select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'picture': 1, 'mobileNumbers': 1}
    }).populate({
      path: 'members',
      model: 'User',
      select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'picture': 1, 'mobileNumbers': 1}
    }));

  if (chatErr) {
    res.status(500).send({
      message: 'An error occurred while getting chat messages',
      error: chatErr,
    });
    return;
  }

  if (!chat) {
    res.status(404).send({
      message: 'No chat found',
    });
    return;
  }

  res.status(200).send(chat);
  return;
};

/* ==================================================== CREATE INBOX ==================================================== */
exports.createInbox = async (req, res) => {
  const [existingInbox, existingInboxErr] = await common.p2r(
    Inbox.findOne({ user: req.body.user })
  );

  if (existingInboxErr) {
    res.status(500).send({
      message: 'An error occurred while checking if user inbox exists',
      error: existingInboxErr,
    });
    return;
  }

  if (existingInbox) {
    res.status(500).send({
      message: 'User inbox already exists',
    });
    return;
  }

  const newInbox = new Inbox({
    user: req.body.user,
  });

  const [saveInbox, saveInboxErr] = await common.p2r(newInbox.save());

  if (saveInboxErr) {
    res.status(500).send({
      message: 'An error occurred while creating user inbox',
      error: saveInboxErr,
    });
    return;
  }

  if (!saveInbox) {
    res.status(500).send({
      message: 'User inbox not created',
    });
    return;
  }

  res.status(200).send({ message: 'User inbox created successfully' });
  return;
};

/* ==================================================== GET USER INBOX ==================================================== */

exports.getUserInbox = async (req, res) => {
  const [userInbox, userInboxErr] = await common.p2r(
    Inbox.findOne({ user: req.params.userId }).sort({updatedAt: 1}).populate({
      path: 'inboxUsers',
      model: 'User',
      select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1, 'landlineNumber': 1, 'picture': 1, 'mobileNumbers': 1, 'whatsapp': 1, 'createdAt': 1, 'updatedAt': 1},
      // options: { sort: { updatedAt: 1 } }
    })
  );

  if (userInboxErr) {
    res.status(500).send({
      message: 'An error occurred while finding user inbox',
      error: userInboxErr,
    });
    return;
  }

  if (!userInbox) {
    res.status(404).send({
      message: 'An inbox does not exist for user',
    });
    return;
  }

  const inboxUsers = userInbox.inboxUsers || [];
  
  const userChats = await Chat.aggregate([
    { $match: { members: { $in: inboxUsers.map(user => user._id) } } },
    { $sort: { updatedAt: -1 } },
    {
      $group: {
        _id: "$members",
        lastChat: { $first: "$$ROOT" }
      }
    },
    { $replaceRoot: { newRoot: "$lastChat" } }
  ]);

  // Attach last chat information to each user in the inboxUsers array
  const inboxUsersWithChats = inboxUsers.map(user => {
    let allChat = userChats.find(chat => chat.members.find(id => id.equals(user._id)));
    let lastChat = {}

    if(allChat?.messages?.length > 0){
      lastChat = allChat.messages[allChat.messages.length - 1] 
    }
    return { ...user.toObject(), lastChat };
  });

  inboxUsersWithChats.sort((a, b) => {
    return b.lastChat.timestamp - a.lastChat.timestamp;
  });

  // Update the userInbox object with the modified inboxUsers array
  const updatedUserInbox = { ...userInbox.toObject(), inboxUsers: inboxUsersWithChats };

  res.status(200).send(updatedUserInbox);
  return;
};

exports.deleteInboxChatOfUser = async (req, res) => {
  const { userId, inboxUserId } = req.params;

  try {
    const [userInbox, userInboxErr] = await common.p2r(
      Inbox.findOne({ user: userId })
    );
  
    if (userInboxErr) {
      res.status(500).send({
        message: 'An error occurred while finding user inbox',
        error: userInboxErr,
      });
      return;
    }
  
    if (!userInbox) {
      res.status(404).send({
        message: 'An inbox does not exist for the user',
      });
      return;
    }

    // Check if inboxUserId is in inboxUsers array
    const indexOfInboxUser = userInbox.inboxUsers.indexOf(inboxUserId);
    if (indexOfInboxUser !== -1) {
      // Remove inboxUserId from the inboxUsers array
      userInbox.inboxUsers.splice(indexOfInboxUser, 1);

      // Save the updated userInbox to the database
      await userInbox.save();

      res.status(200).send({
        message: 'User removed from inbox',
      });
    } else {
      res.status(404).send({
        message: 'User not found in the inbox',
      });
    }

  } catch (error) {
    res.status(500).send({
      message: 'An error occurred',
      error: error.message,
    });
  }
};

