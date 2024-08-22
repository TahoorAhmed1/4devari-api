const mongoose = require("mongoose");
const dataConfig = require("../../config/data.config");

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

const Property = mongoose.model(
  "Property",
  new mongoose.Schema(
    {
      purpose: {
        type: String,
        enum: ["buy", "rent", "coliving space", "coworking space"],
      },
      // property types and subtypes
      type: {
        type: String,
        enum: ["residential", "commercial", "plot"],
        required: true,
      },
      //subtype: { type: String },
      city: String,
      location: String,
      reference: String,
      reference_contact: String,
      mapPin: String,
      plusCode: String,
      areaSize: Number,
      areaSizeUnit: String,
      listingExpiry: String,
      geoLocation: {
        type: pointSchema,
        index: "2dsphere",
      },

      title: {
        type: String,
      },
      description: { type: String },

      images: [{ type: String }],
      videos: [{ type: String }],
      documents: [{ type: String }],
      videoLink: String,
      videoTitle: String,
      videoHost: String,

      contactPerson: String,
      landlineNumber: String,
      mobileNumbers: [{ type: String }],
      email: String,
      whatsapp: String,

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      features: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PropertyFeatures",
      },
      expiry: { type: Date, default: Date.now() },
      status: {
        type: String,
        enum: Object.values(dataConfig.status),
        // will change to pending if add listing price
        default: dataConfig.status.ACTIVE
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
module.exports = Property;
