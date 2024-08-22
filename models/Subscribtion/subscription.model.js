const mongoose = require("mongoose");

const Subscription = mongoose.model(
  "Subscription",
  new mongoose.Schema(
    {
      email: {
        type: String,
        unique: true,
        sparse: true,
      },
      name: {
        type: String,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    {
      timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    }
  )
);
module.exports = Subscription;
