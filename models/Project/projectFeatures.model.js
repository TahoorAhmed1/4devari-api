const mongoose = require("mongoose");
const ProjectFeatures = mongoose.model(
  "ProjectFeatures",
  new mongoose.Schema({
    // mainFeatures
    lobbyInBuilding: String,
    doubleGlazedWindows: String,
    centralAirConditioning: String,
    centralHeating: String,
    flooring: {
      type: String,
      // enum: ['Tiles', 'Marble', 'Wooden', 'Chip', 'Cement', 'Other'],
    },
    electricityBackup: {
      type: String,
      // enum: ['None', 'Generator', 'UPS', 'Solar', 'Other'],
    },
    fireFightingSystem: String,
    elevators: String,
    serviceElevatorsInBuilding: String,
    otherMainFeatures: [{ type: String }],
    gatedCommunity: String,
    parkingSpaces: String,
    // plot features
    sewerage: String,
    utilities: String,
    accessibleByRoad: String,
    // business And Communication
    broadbandInternetAccess: String,
    satelliteOrCable: String,
    businessCenterOrMediaRoom: String,
    intercom: String,
    atmMachines: String,
    otherBusinessAndCommunicationFeatures: [{ type: String }],
    // community Features
    communityLawnOrGarden: String,
    communitySwimmingPool: String,
    communityGym: String,
    firstAidOrMedicalCenter: String,
    dayCareCenter: String,
    kidsPlayArea: String,
    barbecueArea: String,
    mosque: String,
    communityCenter: String,
    otherCommunityFeatures: [{ type: String }],

    // nearby Locations
    nearbySchools: String,
    nearbyHospitals: String,
    nearbyShoppingMalls: String,
    nearbyRestaurants: String,
    distanceFromAirport: Number,
    nearbyPublicTransport: String,
    otherNearbyPlaces: [{ type: String }],

    //otherFacilities
    maintenanceStaff: String,
    securityStaff: String,
    facilitiesForDisabled: String,
    otherFacilities: [{ type: String }],
    cctvSecurity: String,

    // healthcareAndRecreational
    lawnOrGarden: String,
    swimmingPool: String,
    otherHealthcareAndRecreationalFeatures: [{ type: String }],
  })
);
module.exports = ProjectFeatures;
