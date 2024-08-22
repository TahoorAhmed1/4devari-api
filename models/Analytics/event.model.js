const mongoose = require("mongoose");

const Event = mongoose.model(
  "Event",
  new mongoose.Schema(
    {
      category: {
        type: String,
        enum: ["click", "view"],
      },
      name: {
        type: String,
        enum: [
          "whatsapp-click",
          "chat-click",
          "email-click",
          "profile-view",
          "property-view",
          "project-view",
        ],
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
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
module.exports = Event;
