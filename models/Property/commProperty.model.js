const mongoose = require('mongoose');
const data = require('../../config/data.config');

const CommProperty = mongoose.model(
  'CommProperty',
  new mongoose.Schema({
    subtype: {
      type: String,
      // required: true,
      enum: data.commercialPropertyTypes,
    },
    installmentAvailable: {
      type: Boolean,
      default: false,
    },
    remainingInstallments: String,
    monthlyInstallments: String,
    possessionStatus: {
      type: Boolean,
      default: false,
    },
    price: String,
    priceUnit: String,
    address: String,
    streetNumber: String,
    noOfBedrooms: String,
    noOfBathrooms: String,

    minimumContractPeriod: {
      type: String,
    },
    monthlyRent: String,

    occupancyStatus: {
      type: String,
      // enum: ['Occupied', 'Vacant'],
    },
    availableFrom: Date,
    furnishing: {
      type: String,
      // enum: ['Unfurnished', 'Semi-furnished', 'Fully furnished'],
    },

    room_sharing_type: {
      type: String,
    },
    room_sharing_subtype: {
      type: String,
    },
    private_room: {
      type: String,
    },
    foodAvailability: {
      type: String,
    },
    gender: {
      type: String,
    },
    occupantsType: {
      type: String,
    },
    monthlyRentPerRoom: String,
    monthlyRentPerRoomInWords: String,
    monthlyRentPerBed: String,
    monthlyRentPerBedInWords: String,
    securityDepositAmount: String,
    advanceAmount: String,
    houseRules: [{ type: String }],
    smoking: { type: String},
    funLovingOccupants: {type: String },
    chillLandlord: { type: String },
    petPolicy: { type: String },
    houseHelp: { type: String},
    guest: { type: String },
    morePrivateRoomsAvailable: String,
    moreSharedRoomsAvailable: String,

    /* features here */

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
    },
  })
);

module.exports = CommProperty;
