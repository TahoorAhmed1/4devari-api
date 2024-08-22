const mongoose = require('mongoose');
const Builder = mongoose.model(
  'Builder',
  new mongoose.Schema({
    builderName: String,
    builderLogo: String,
    builderCoverPicture: String,
    aboutUs: String,
    ntn: String,
    experienceYears: String,
    onGoingProjects: String,
    pastProjects: String,
    experienceYears: String,
    operatingCities: [{ type: String }],
    verificationType: {
      type: String,
      enum: ['basic', 'elite'],
      default: 'basic',
    },

    // Contact form
    additionalMobileNumber: String,
    landline: String,
    additionalwhatsapp: String,

    // Other details
    name: String,
    owners: [{ type: String }],
    cnic: String,
    partners: [{ type: String }],

    // frontend integration
    additionalEmail: String,

    totalProjects: Number,

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },{
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  })
);
module.exports = Builder;
