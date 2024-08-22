const mongoose = require('mongoose');
const Chat = mongoose.model(
  'Chat',
  new mongoose.Schema({
    subject: String,
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: Number,
        message: String,
      },
    ],
    inbox: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inbox',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    referencePrperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
    referenceProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ]
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  })
);
module.exports = Chat;
