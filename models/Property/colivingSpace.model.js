const mongoose = require('mongoose');
const data = require('../../config/data.config');

const ColivingSpace = mongoose.model(
  'ColivingSpace',
  new mongoose.Schema({
    subtype: {
      type: String,
      // required: true,
      enum: data.colivingSpaceTypes,
    },
    room_sharing_type: {
      type: String,
      // enum: ['Private', 'Double', 'Triple', 'More than 3'],
    },
    room_sharing_subtype: {
      type: String,
    },
    private_room: {
      type: String,
    },
    sharedRoomAmt: {
      type: String,
      // enum: ['Double', 'Triple', 'More than 3'],
    },

    price: String,
    priceUnit: String,
    address: String,
    streetNumber: String,
    houseNumber: String,
    flatNumber: String,
    floorNumber: String,
    unitNumber: String,

    noOfBedrooms: Number,
    noOfBathrooms: Number,
    foodAvailability: {
      type: String,
      // enum: ['Y', 'N'],
    },
    gender: {
      type: String,
      // enum: ['Girls only', 'Boys only', 'Any'],
    },
    occupantsType: {
      type: String,
      // enum: ['Students', 'Working professionals', 'Any'],
    },
    occupancyStatus: {
      type: String,
      // enum: ['Occupied', 'Vacant'],
    },
    availableFrom: Date,
    furnishing: {
      type: String,
      // enum: ['Unfurnished', 'Semi-furnished', 'Fully furnished'],
    },

    minimumContractPeriod: {
      type: String,
    },
    monthlyRent: String,
    monthlyRentPerRoom: String,
    monthlyRentPerRoomInWords: String,
    monthlyRentPerBed: String,
    monthlyRentPerBedInWords: String,
    securityDepositAmount: String,
    advanceAmount: String,

    installmentAvailable: String,
    remainingInstallments: String,
    monthlyInstallments: String,
    possessionStatus: String,

    houseRules: [{ type: String }],
    smoking: { type: String, 
      // enum: ['Allowed', 'Not allowed']
     },
    funLovingOccupants: {
      type: String,
      // enum: ['Y', 'N'],
    },
    chillLandlord: {
      type: String,
      // enum: ['Y', 'N'],
    },
    petPolicy: { type: String, 
      // enum: ['Allowed', 'Not allowed'] 
    },
    houseHelp: { type: String, 
      // enum: ['None', 'Cleaning', 'Cooking'] 
    },
    guest: { type: String, 
      // enum: ['Allowed', 'Not allowed']
     },
    morePrivateRoomsAvailable: String,
    moreSharedRoomsAvailable: String,
    moreRoomsSameFeatures: String,
    moreRoomsDifferentFeatures: String,
    /* features here */

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
    },
  })
);

module.exports = ColivingSpace;
