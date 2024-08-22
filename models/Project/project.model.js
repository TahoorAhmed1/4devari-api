const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number],
  },
});

const Project = mongoose.model(
  "Project",
  new mongoose.Schema(
    {
      name: String,
      city: String,
      location: String,
      reference: String,
      bookingOrSiteOfficeAddress: [{ type: String }],
      mapPin: String,
      plusCode: String,
      geoLocation: {
        type: pointSchema,
        index: "2dsphere",
      },
      projectLogo: String,

      units: [{ type: Object }],

      type: String,
      subtype: String,
      area: String,
      bed: Number,
      bath: Number,
      price: String,

      status: {
        type: String,
        enum: [
          "Advance Stage",
          "Early Stage",
          "Mid Stage",
          "Near possession",
          "New Launch",
          "Ready to move",
          "Under construction",
          "Well occupied",
        ],
      },

      description: String,
      documents: [{ type: String }],
      floorPlans: [{ type: String }],
      paymentPlans: [{ type: String }],
      progressUpdate: [{ type: String }],

      images: [{ type: String }],
      videos: [{ type: String }],
      videoLink: String,
      videoTitle: String,
      videoHost: String,

      contactPerson: String,
      landlineNumber: String,
      mobileNumbers: [{ type: String, required: true }],
      email: String,
      whatsapp: String,

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      features: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProjectFeatures",
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
module.exports = Project;
