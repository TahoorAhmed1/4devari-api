const mongoose = require('mongoose');
const Agency = mongoose.model(
  'Agency',
  new mongoose.Schema({
    agencyName: String,
    verificationType: {
      type: String,
      enum: ['basic', 'elite'],
      default: 'basic',
    },
    description: String,
    serviceAreas: [
      {
        type: String,
      },
    ],
    propertyType: {
      type: [String],
      enum: ['residential', 'commercial', 'plot'],
    },
    propertyFor: {
      type: [String],
      enum: ['sale', 'rent', 'shared spaces'],
    },
    experienceYears: String,
    agencyLogo: String,
    agencyCoverPicture: String,
    primaryPicture: String,
    physicalAddress: String,

    // frontend integration
    additionalEmail: String,
    additionalMobileNumber: String,
    additionalwhatsapp: String,

    // CEO
    ceoName: String,
    ceoDesignation: String,
    ceoMessage: String,
    ceoPicture: String,

    totalProperties: Number,
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  })
);
module.exports = Agency;
