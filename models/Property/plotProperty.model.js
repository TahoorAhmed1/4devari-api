const mongoose = require('mongoose');
const data = require('../../config/data.config');

const PlotProperty = mongoose.model(
  'PlotProperty',
  new mongoose.Schema({
    subtype: {
      type: String,
      // required: true,
      enum: data.plotPropertyTypes,
    },
    occupancyStatus: {
      type: String,
      // enum: ['Occupied', 'Vacant'],
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
    availableFrom: Date,
    address: String,
    price: String,
    priceUnit: String,

    minimumContractPeriod: {
      type: String,
    },
    monthlyRent: String,
    /* features here */

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
    },
  })
);

module.exports = PlotProperty;
