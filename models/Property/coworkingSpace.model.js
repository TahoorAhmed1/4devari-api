const mongoose = require('mongoose');
const data = require('../../config/data.config');

const CoworkingSpace = mongoose.model(
  'CoworkingSpace',
  new mongoose.Schema({
    price: String,
    priceUnit: String,
    address: String,
    streetNumber: String,

    officeNumber: String,
    floorNumber: String,
    advanceAmount: String,

    furnishing: {
      type: String,
      // enum: ['Unfurnished', 'Semi-furnished', 'Fully furnished'],
    },
    minimumContractPeriod: {type: String},
    privateOffice: { type: String, 
      // enum: ['Allowed', 'Not allowed'] 
    },
    noOfPrivateOfficesAvailable: Number,
    privateOfficeAvailableOn: {
      type: String,
      // enum: ['Monthly', 'Daily', 'Hourly'],
    },
    privateOfficeRentPerHour: Number,
    privateOfficeRentPerDay: Number,
    privateOfficePriceMonth: Number,

    conferenceRoom: { type: String, 
      // enum: ['Available', 'Not available'] 
    },
    conferenceRoomCapacity: Number,
    conferenceRoomAvailableOn: {
      type: String,
      // enum: ['Monthly', 'Daily', 'Hourly'],
    },
    conferenceRoomRentPerHour: Number,
    conferenceRoomPriceDay: Number,
    conferenceRoomRentPerMonth: Number,

    sharedDesk: { type: String, 
      // enum: ['Available', 'Not available']
     },
    noOfSharedDesksAvailable: Number,
    sharedDeskAvailableOn: {
      type: String,
      // enum: ['Monthly', 'Daily', 'Hourly'],
    },
    sharedDeskRentPerHour: Number,
    sharedDeskRentPerDay: Number,
    sharedDeskRentPerMonth: Number,

    dedicatedDesk: { type: String, 
      // enum: ['Available', 'Not available'] 
    },
    noOfDedicatedDesksAvailable: Number,
    dedicatedDeskAvailableOn: {
      type: String,
      // enum: ['Monthly', 'Daily', 'Hourly'],
    },
    dedicatedDeskRentPerHour: Number,
    dedicatedDeskRentPerDay: Number,
    dedicatedDeskRentPerMonth: Number,

    managerDesk: { type: String, 
      // enum: ['Available', 'Not available'] 
    },
    noOfManagerDesksAvailable: Number,
    managerDeskAvailableOn: {
      type: String,
      // enum: ['Monthly', 'Daily', 'Hourly'],
    },
    managerDeskRentPerHour: Number,
    managerDeskRentPerDay: Number,
    managerDeskRentPerMonth: Number,

    executiveDesk: { type: String,
      //  enum: ['Available', 'Not available'] 
      },
    noOfExecutiveDesksAvailable: Number,
    executiveDeskAvailableOn: {
      type: String,
      // enum: ['Monthly', 'Daily', 'Hourly'],
    },
    executiveDeskRentPerHour: Number,
    executiveDeskRentPerDay: Number,
    executiveDeskRentPerMonth: Number,

    meetingRoom: { type: String, 
      // enum: ['Available', 'Not available'] 
    },
    noOfMeetingRoomsAvailable: Number,
    meetingRoomAvailableOn: {
      type: String,
      // enum: ['Monthly', 'Daily', 'Hourly'],
    },
    meetingRoomRentPerHour: Number,
    meetingRoomRentPerDay: Number,
    meetingRoomRentPerMonth: Number,

    installmentAvailable: String,
    remainingInstallments: String,
    monthlyInstallments: String,
    possessionStatus: String,

    /* features here */

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
    },
  })
);

module.exports = CoworkingSpace;
