const mongoose = require('mongoose');

const Inbox = mongoose.model(
  'Inbox',
  new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    inboxUsers:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  })
);
module.exports = Inbox;
