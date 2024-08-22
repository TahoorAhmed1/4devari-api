const mongoose = require("mongoose");

const recentSearchesSchema = new mongoose.Schema({
  address: String,
  lat: Number,
  lng: Number,
  radius: Number,
  minPrice: Number,
  maxPrice: Number,
  minAreaSize: Number,
  maxAreaSize: Number,
  type: String,
  purpose: String,
  subtype: String,
  city: {
    type: [{ type: String }],
    default: [],
  },
});

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
    },
    type: {
      type: String,
      enum: ["enduser", "agency", "staff", "builder", "admin", "superadmin"],
      default: "enduser",
    },
    status: {
      type: String,
      enum: ["Pending", "Active"],
      // default: 'Active',
      // Note: When email config is enabled then default is set to Pending
      default: "Pending",
    },

    confirmationCode: String,
    resetPasswordCode: String,

    social_user_id: String,
    name: String,
    registration_type: {
      type: String,
      enum: ["email", "facebook", "google"],
      default: "email",
    },

    city: String,
    country: String,
    address: String,
    picture: String,

    landlineNumber: String,
    mobileNumbers: [{ type: String }],
    whatsapp: String,

    // Link
    facebook: String,
    instagram: String,
    ticktok: String,
    youtube: String,

    // Check
    profileStatus: {
      type: String,
      enum: ["Pending", "Completed"],
    },

    // Recent Searches
    recentSearches: [recentSearchesSchema],

    // Liked
    likedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    likedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  })
);
module.exports = User;
