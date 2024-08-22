const mongoose = require('mongoose');
const Staff = mongoose.model(
  'Staff',
  new mongoose.Schema({
    staffPicture: String,
    name: String,
    experienceYears: String,
    propertyType: {
      type: [String],
      enum: ['residential', 'commercial', 'plot'],
    },
    propertyFor: {
      type: [String],
      enum: ['sale', 'rent', 'shared spaces'],
    },

    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  })
);
module.exports = Staff;
