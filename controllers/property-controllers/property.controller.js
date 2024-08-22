const dataConfig = require("../../config/data.config");

const db = require('../../models');
const {
  Property,
  ResProperty,
  CommProperty,
  PlotProperty,
  ColivingSpace,
  CoworkingSpace,
  PropertyFeatures,
  User
} = db;
const common = require('../../config/common.config');
const { default: mongoose } = require('mongoose');

/* ============================================================= COMMON PROPERTY FILTERS ============================================================= */

function applyFilters(filterOptions, propertyFilterOptions, req) {
  if(req.query?.subtype) {
    const reqArray = req.query.subtype.split(',').map((item) => item.trim().charAt(0).toUpperCase() + item.slice(1).toLowerCase());
    filterOptions.subtype = { $in: reqArray }
  };
  if(req.query?.noOfBedrooms && req.query?.noOfBedrooms !== "all") {
    const reqArray = req.query.noOfBedrooms.split(',').map((item) => item.trim());
    filterOptions.noOfBedrooms = { $in: reqArray }
  };
  if(req.query?.noOfBathrooms && req.query?.noOfBathrooms !== "all") {
    const reqArray = req.query.noOfBathrooms.split(',').map((item) => item.trim());
    filterOptions.noOfBathrooms = { $in: reqArray }
  };
  if(req.query?.ids) {
    const reqArray = req.query.ids.split(',').map((item) => mongoose.Types.ObjectId(item));
    filterOptions._id = { $in: reqArray }
  };
  if(req.query?.address) filterOptions.address = { $regex: req.query.address, $options: "i" };
  if(req.query?.minPrice || req.query?.maxPrice ) {
    filterOptions.price = {
      $gte: req.query?.minPrice || 0,
      $lte: req.query?.maxPrice || Infinity
    };
  }

  /*//////////////// PROPERT FILTER QURIES  ///////////////////////////*/ 
  
  if(req.query?.userId){
    propertyFilterOptions.$or = [
      { user: req.query?.userId },
      { staff: req.query?.userId }
    ];
  
  } 

  if(req.query?.purpose){
    const reqArray = req.query.purpose.split(',').map((item) => item.trim());
    propertyFilterOptions.purpose = { $in: reqArray };
  } 
    
  if(req.query?.type){
    const reqArray = req.query.type.split(',').map((item) => item.trim());
    propertyFilterOptions.type = { $in: reqArray };
  };
  if(req.query?.city){
    const reqArray = req.query.city.split(',').map((item) => new RegExp(item.trim(), 'i'));
    propertyFilterOptions.city = { $in: reqArray }
  }
  if(req.query?.location) {
    const reqArray = req.query.location.split(',').map((item) => new RegExp(item.trim(), 'i'));
    propertyFilterOptions.location = { $in: reqArray };
  }
  if(req.query?.minAreaSize || req.query?.maxAreaSize ) {
    propertyFilterOptions.areaSize = {
      $gte: req.query.minAreaSize || 0,
      $lte: req.query.maxAreaSize || Infinity
    }
  }
  if (req.query?.lat && req.query?.lng) {
    const radius = req.query?.radius || 10; // Set your desired radius in kilometers
    propertyFilterOptions.geoLocation = {
      $geoWithin: {
        $centerSphere: [[parseFloat(req.query.lng), parseFloat(req.query.lat)], radius / 6371] // 6371 is the approximate radius of the Earth in kilometers
      }
    };
  }
}

function applySort(sortOptions, req) {
  if(req.query?.sort){
    switch (req.query.sort) {
      case 'oldest':
        return sortOptions.createdAt = 1;
      case 'newest':
        return sortOptions.createdAt = -1;
      case 'priceLow':
        return sortOptions.price = 1;
      case 'priceHigh':
        return sortOptions.price = -1;
      // case 'popular':
      //   return sortOptions.popular = -1;
      default:
        return sortOptions; // No sorting
    }
  };
}

function applyAllPropertySort(array, criteria) {
  return array.sort((a, b) => {
    switch (criteria) {
      case 'oldest':
        return new Date(a?.property?.createdAt) - new Date(b?.property?.createdAt);
      case 'newest':
        return new Date(b?.property?.createdAt) - new Date(a?.property?.createdAt);
      case 'priceLow':
        return a.price - b.price;
      case 'priceHigh':
        return b.price - a.price;
      // case 'popular':
      //   return b.popularity - a.popularity;
      default:
        return 0; // No sorting
    }
  });
}

/* ================================================= Expiry Property ============================== */
exports.archiveExpiredProperties = async () => {
  try {
    const currentDate = new Date();
    // Find properties that have expired
    const expiredProperties = await Property.find({ expiry: { $lt: currentDate }, status: { $ne: dataConfig.status.ARCHIVED } });

    // Archive or process the expired properties as needed
    // For example, update a status field to 'archived'
    if(expiredProperties?.length  < 1) return console.error('No Expired Property found');

    console.log("Expired Properties", expiredProperties)

    await Property.updateMany(
      { _id: { $in: expiredProperties.map(prop => prop._id) } },
      { $set: { status: dataConfig.status.ARCHIVED } }
    );

    console.log(`${expiredProperties.length} properties archived.`);
  } catch (error) {
    console.error('Error archiving properties:', error);
  }
}; 

/* ============================================================= ADD PROPERTY ============================================================= */
exports.addProperty = async (req, res) => {
  let expiryMonths = 1;
  if(req?.body?.listingExpiry === "Two Months"){
    expiryMonths = 2;
  }else if(req?.body?.listingExpiry === "Three Months"){
    expiryMonths = 3;
  }

  // Features
  let propertyFeatures = new PropertyFeatures(req.body);
  if(!propertyFeatures?._id){
    propertyFeatures = new PropertyFeatures()
  }
  const [addedPropertyFeatures, propertyFeaturesErr] = await common.p2r(propertyFeatures.save());

  console.log("propertyFeatures:===",propertyFeatures)

  if (propertyFeaturesErr) {
    res.status(500).send({
      message: 'An error occurred while adding property feature',
      error: propertyFeaturesErr,
    });
    return;
  }

  if (!addedPropertyFeatures) {
    res.status(500).send({ message: 'Property feature not added' });
    return;
  }

  // Property
  const prop = new Property({
    ...req.body,
    purpose: req.body.purpose,
    type: req.body.type,
    city: req.body.city,
    location: req.body.location,
    reference: req.body.reference,
    reference_contact: req.body.reference_contact,
    mapPin: req.body.mapPin,
    plusCode: req.body.plusCode,
    areaSize: req.body.areaSize,
    areaSizeUnit: req.body.areaSizeUnit,
    listingExpiry: req.body.listingExpiry,
    geoLocation: req.body.geoLocation,
    title: req.body.title,
    description: req.body.description,
    images: req.body.images,
    videos: req.body.videos,
    documents: req.body.documents,
    videoLink: req.body.videoLink,
    videoTitle: req.body.videoTitle,
    videoHost: req.body.videoHost,
    contactPerson: req.body.contactPerson,
    landlineNumber: req.body.landlineNumber,
    mobileNumbers: req.body.mobileNumbers,
    email: req.body.email,
    whatsapp: req.body.whatsapp,
    user: req.body.user,
    staff: req.body.staff,
    features: req.body.features,
    expiry: new Date(Date.now() + expiryMonths * 30 * 24 * 60 * 60 * 1000)
  });

  if (addedPropertyFeatures?._id) {
    prop.features = addedPropertyFeatures._id
  }

  console.log("property:===",prop)


  const [addedProp, propErr] = await common.p2r(prop.save());

  if (propErr) {
    res.status(500).send({
      message: 'An error occurred while adding property',
      error: propErr,
    });
    return;
  }

  if (!addedProp) {
    res.status(500).send({ message: 'Property not added' });
    return;
  }

  

  let ignoreType = ['coliving space', 'coworking space']

  if (!ignoreType.includes(req.body.purpose) && req.body.type.toLowerCase() === 'residential') {
    const resProp = new ResProperty({
      ...req.body,
      subtype: req.body.subtype,
      address: req.body.address,
      price: req.body.price,
      priceUnit: req.body.priceUnit,
      installmentAvailable: req.body.installmentAvailable,
      possessionStatus: req.body.possessionStatus,
      streetNumber: req.body.streetNumber,
      noOfBedrooms: req.body.noOfBedrooms,
      noOfBathrooms: req.body.noOfBathrooms,
      occupancyStatus: req.body.occupancyStatus,
      availableFrom: req.body.availableFrom,
      furnishing: req.body.furnishing,
      property: addedProp._id,
    });

    const [addedResProp, resErr] = await common.p2r(resProp.save());

    if (resErr) {
      res.status(500).send({
        message: 'An error occurred while adding residential property',
        error: resErr,
      });
      return;
    }

    if (!addedResProp) {
      res.status(500).send({
        message: 'Residential property not added',
      });
      return;
    }

    addedResProp.property = addedProp;
    res.status(200).send(addedResProp);
    return;
  } else if (!ignoreType.includes(req.body.purpose) && req.body.type.toLowerCase() === 'commercial') {
    const commProp = new CommProperty({
      ...req.body,
      subtype: req.body.subtype,
      address: req.body.address,
      price: req.body.price,
      priceUnit: req.body.priceUnit,
      installmentAvailable: req.body.installmentAvailable,
      possessionStatus: req.body.possessionStatus,
      streetNumber: req.body.streetNumber,
      noOfBedrooms: req.body.noOfBedrooms,
      noOfBathrooms: req.body.noOfBathrooms,
      occupancyStatus: req.body.occupancyStatus,
      availableFrom: req.body.availableFrom,
      furnishing: req.body.furnishing,
      property: addedProp._id,
    });

    const [addedCommProp, commErr] = await common.p2r(commProp.save());

    if (commErr) {
      res.status(500).send({
        message: 'An error occurred while adding commercial property',
        error: commErr,
      });
      return;
    }

    if (!addedCommProp) {
      res.status(500).send({
        message: 'Commercial property not added',
      });
      return;
    }

    addedCommProp.property = addedProp;
    res.status(200).send(addedCommProp);
    return;
  } else if (!ignoreType.includes(req.body.purpose) && req.body.type.toLowerCase() === 'plot') {
    const plotProp = new PlotProperty({
      ...req.body,
      subtype: req.body.subtype,
      occupancyStatus: req.body.occupancyStatus,
      availableFrom: req.body.availableFrom,
      address: req.body.address,
      price: req.body.price,
      priceUnit: req.body.priceUnit,
      installmentAvailable: req.body.installmentAvailable,
      possessionStatus: req.body.possessionStatus,
      property: addedProp._id,
    });

    const [addedPlotProp, plotErr] = await common.p2r(plotProp.save());

    if (plotErr) {
      res.status(500).send({
        message: 'An error occurred while adding plot property',
        error: plotErr,
      });
      return;
    }

    if (!addedPlotProp) {
      res.status(500).send({
        message: 'Plot property not added',
      });
      return;
    }

    addedPlotProp.property = addedProp;
    res.status(200).send(addedPlotProp);
    return;
  } else if (req.body.purpose.toLowerCase() === 'coliving space') {
    const colivSpace = new ColivingSpace({
      ...req.body,
      subtype: req.body.subtype,
      room_sharing_type: req.body.room_sharing_type,
      room_sharing_subtype: req.body.room_sharing_subtype,
      private_room: req.body.private_room,
      sharedRoomAmt: req.body.sharedRoomAmt,
      address: req.body.address,
      price: req.body.price,
      priceUnit: req.body.priceUnit,
      streetNumber: req.body.streetNumber,
      houseNumber: req.body.houseNumber,
      flatNumber: req.body.flatNumber,
      floorNumber: req.body.floorNumber,
      unitNumber: req.body.unitNumber,
      noOfBedrooms: req.body.noOfBedrooms,
      noOfBathrooms: req.body.noOfBathrooms,
      foodAvailability: req.body.foodAvailability,
      gender: req.body.gender,
      occupantsType: req.body.occupantsType,
      occupancyStatus: req.body.occupancyStatus,
      availableFrom: req.body.availableFrom,
      furnishing: req.body.furnishing,
      minimumContractPeriod: req.body.minimumContractPeriod,
      monthlyRentPerRoom: req.body.monthlyRentPerRoom,
      monthlyRentPerRoomInWords: req.body.monthlyRentPerRoomInWords,
      monthlyRentPerBed: req.body.monthlyRentPerBed,
      monthlyRentPerBedInWords: req.body.monthlyRentPerBedInWords,
      securityDepositAmount: req.body.securityDepositAmount,
      advanceAmount: req.body.advanceAmount,
      houseRules: req.body.houseRules,
      smoking: req.body.smoking,
      funLovingOccupants: req.body.funLovingOccupants,
      chillLandlord: req.body.chillLandlord,
      petPolicy: req.body.petPolicy,
      houseHelp: req.body.houseHelp,
      guest: req.body.guest,
      morePrivateRoomsAvailable: req.body.morePrivateRoomsAvailable,
      moreSharedRoomsAvailable: req.body.moreSharedRoomsAvailable,
      property: addedProp._id,
    });

    const [addedColivSpace, colivErr] = await common.p2r(colivSpace.save());

    if (colivErr) {
      res.status(500).send({
        message: 'An error occurred while adding coliving space property',
        error: colivErr,
      });
      return;
    }

    if (!addedColivSpace) {
      res.status(500).send({
        message: 'Coliving space property not added',
      });
      return;
    }

    addedColivSpace.property = addedProp;
    res.status(200).send(addedColivSpace);
    return;
  } else if (req.body.purpose.toLowerCase() === 'coworking space') {
    const coworkSpace = new CoworkingSpace({
      ...req.body,
      address: req.body.address,
      price: req.body.price,
      priceUnit: req.body.priceUnit,
      streetNumber: req.body.streetNumber,
      officeNumber: req.body.officeNumber,
      floorNumber: req.body.floorNumber,
      minimumContractPeriod: req.body.minimumContractPeriod,

      furnishing: req.body.furnishing,
      privateOffice: req.body.privateOffice,
      noOfPrivateOfficesAvailable: req.body.noOfPrivateOfficesAvailable,
      privateOfficeAvailableOn: req.body.privateOfficeAvailableOn,
      privateOfficeRentPerHour: req.body.privateOfficeRentPerHour,
      privateOfficeRentPerDay: req.body.privateOfficeRentPerDay,
      privateOfficeRentPerMonth: req.body.privateOfficeRentPerMonth,

      conferenceRoom: req.body.conferenceRoom,
      conferenceRoomCapacity: req.body.conferenceRoomCapacity,
      conferenceRoomAvailableOn: req.body.conferenceRoomAvailableOn,
      conferenceRoomRentPerHour: req.body.conferenceRoomRentPerHour,
      conferenceRoomRentPerDay: req.body.conferenceRoomRentPerDay,
      conferenceRoomRentPerMonth: req.body.conferenceRoomRentPerMonth,

      sharedDesk: req.body.sharedDesk,
      noOfSharedDesksAvailable: req.body.noOfSharedDesksAvailable,
      sharedDeskAvailableOn: req.body.sharedDeskAvailableOn,
      sharedDeskRentPerHour: req.body.sharedDeskRentPerHour,
      sharedDeskRentPerDay: req.body.sharedDeskRentPerDay,
      sharedDeskRentPerMonth: req.body.sharedDeskRentPerMonth,

      dedicatedDesk: req.body.dedicatedDesk,
      noOfDedicatedDesksAvailable: req.body.noOfDedicatedDesksAvailable,
      dedicatedDeskAvailableOn: req.body.dedicatedDeskAvailableOn,
      dedicatedDeskRentPerHour: req.body.dedicatedDeskRentPerHour,
      dedicatedDeskRentPerDay: req.body.dedicatedDeskRentPerDay,
      dedicatedDeskRentPerMonth: req.body.dedicatedDeskRentPerMonth,

      managerDesk: req.body.managerDesk,
      noOfManagerDesksAvailable: req.body.noOfManagerDesksAvailable,
      managerDeskAvailableOn: req.body.managerDeskAvailableOn,
      managerDeskRentPerHour: req.body.managerDeskRentPerHour,
      managerDeskRentPerDay: req.body.managerDeskRentPerDay,
      managerDeskRentPerMonth: req.body.managerDeskRentPerMonth,

      executiveDesk: req.body.executiveDesk,
      noOfExecutiveDesksAvailable: req.body.noOfExecutiveDesksAvailable,
      executiveDeskAvailableOn: req.body.executiveDeskAvailableOn,
      executiveDeskRentPerHour: req.body.executiveDeskRentPerHour,
      executiveDeskRentPerDay: req.body.executiveDeskRentPerDay,
      executiveDeskRentPerMonth: req.body.executiveDeskRentPerMonth,

      meetingRoom: req.body.meetingRoom,
      noOfMeetingRoomsAvailable: req.body.noOfMeetingRoomsAvailable,
      meetingRoomAvailableOn: req.body.meetingRoomAvailableOn,
      meetingRoomRentPerHour: req.body.meetingRoomRentPerHour,
      meetingRoomRentPerDay: req.body.meetingRoomRentPerDay,
      meetingRoomRentPerMonth: req.body.meetingRoomRentPerMonth,

      property: addedProp._id,
    });

    const [addedCoworkSpace, coworkErr] = await common.p2r(coworkSpace.save());

    if (coworkErr) {
      res.status(500).send({
        message: 'An error occurred while adding coworking space property',
        error: coworkErr,
      });
      return;
    }

    if (!addedCoworkSpace) {
      res.status(500).send({
        message: 'Coworking space property not added',
      });
      return;
    }

    addedCoworkSpace.property = addedProp;
    res.status(200).send(addedCoworkSpace);
    return;
  } else {
    res.status(500).send({ message: 'Please specify property type' });
    return;
  }
};

/* ============================================================= UPDATE PROPERTY ============================================================= */
exports.updateProperty = async (req, res) => {
  // let imagesNew = [];
  // if (req.body.images) {
  //   for (let i = 0; i < req.body.images.length; i++) {
  //     let imageName = req.body.images[i];
  //     imageName = imageName.replace(/ /g, '-');
  //     imagesNew.push(
  //       'property/' +
  //         req.params.id +
  //         '/images/' +
  //         common.appendDateToImage(imageName)
  //     );
  //   }
  // }

  // if (imagesNew.length) {
  //   req.body.images = imagesNew;
  // }

  // let videosNew = [];
  // if (req.body.videos) {
  //   for (let i = 0; i < req.body.videos.length; i++) {
  //     let videoName = req.body.videos[i];
  //     videoName = videoName.replace(/ /g, '-');
  //     videosNew.push(
  //       'property/' +
  //         req.params.id +
  //         '/videos/' +
  //         common.appendDateToImage(videoName)
  //     );
  //   }
  // }

  // if (videosNew.length) {
  //   req.body.videos = videosNew;
  // }

  const [updatedProperty, updatePropErr] = await common.p2r(
    Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
  );

  if (updatePropErr) {
    res.status(500).send({
      message: 'An error occurred while updating property',
      error: updatePropErr,
    });
    return;
  }

  if (!updatedProperty) {
    return res.status(404).send({ message: 'Property not found or updated' });
  }

  if (updatedProperty?.features) {
    const [updatedFeatures, updateFeaturesErr] = await common.p2r(
      PropertyFeatures.findByIdAndUpdate(updatedProperty.features, req.body, {
        new: true,
        runValidators: true,
      })
    );
    if (updateFeaturesErr) {
      res.status(500).send({
        message: 'An error occurred while updating property features',
        error: updateFeaturesErr,
      });
      return;
    }
  
    if (!updatedFeatures) {
      return res.status(404).send({ message: 'Features not found or updated' });
    }
  } 

  let ignoreType = ['coliving space', 'coworking space']

  if (!ignoreType.includes(updatedProperty.purpose) && updatedProperty.type.toLowerCase() === 'residential') {
    const [updatedResProp, updateResErr] = await common.p2r(
      ResProperty.findOneAndUpdate({ property: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      }).populate('property')
    );

    if (updateResErr) {
      res.status(500).send({
        message: 'An error occurred while updating residential property',
        error: updateResErr,
      });
      return;
    }

    if (!updatedResProp) {
      return res
        .status(404)
        .send({ message: 'Residential property not found or updated' });
    }

    res.status(200).send(updatedResProp);
    return;
  } else if (!ignoreType.includes(updatedProperty.purpose) && updatedProperty.type.toLowerCase() === 'commercial') {
    const [updatedCommProp, updateCommErr] = await common.p2r(
      CommProperty.findOneAndUpdate({ property: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      }).populate('property')
    );

    if (updateCommErr) {
      res.status(500).send({
        message: 'An error occurred while updating commercial property',
        error: updateCommErr,
      });
      return;
    }

    if (!updatedCommProp) {
      return res
        .status(404)
        .send({ message: 'Commercial property not found or updated' });
    }

    res.status(200).send(updatedCommProp);
    return;
  } else if (!ignoreType.includes(updatedProperty.purpose) && updatedProperty.type.toLowerCase() === 'plot') {
    const [updatedPlotProp, updatePlotErr] = await common.p2r(
      PlotProperty.findOneAndUpdate({ property: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      }).populate('property')
    );

    if (updatePlotErr) {
      res.status(500).send({
        message: 'An error occurred while updating plot property',
        error: updatePlotErr,
      });
      return;
    }

    if (!updatedPlotProp) {
      return res
        .status(404)
        .send({ message: 'Plot property not found or updated' });
    }

    res.status(200).send(updatedPlotProp);
    return;
  } else if (updatedProperty.purpose.toLowerCase() === 'coliving space') {
    const [updatedColivSpace, updateColivErr] = await common.p2r(
      ColivingSpace.findOneAndUpdate({ property: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      }).populate('property')
    );

    if (updateColivErr) {
      res.status(500).send({
        message: 'An error occurred while updating coliving space property',
        error: updateColivErr,
      });
      return;
    }

    if (!updatedColivSpace) {
      return res
        .status(404)
        .send({ message: 'Coliving space property not found or updated' });
    }

    res.status(200).send(updatedColivSpace);
    return;
  } else if (updatedProperty.purpose.toLowerCase() === 'coworking space') {
    const [updatedCoworkSpace, updateCoworkErr] = await common.p2r(
      CoworkingSpace.findOneAndUpdate({ property: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      }).populate('property')
    );
    console.log("req.body=========",req.body)

    if (updateCoworkErr) {
      res.status(500).send({
        message: 'An error occurred while updating coworking space property',
        error: updateCoworkErr,
      });
      return;
    }

    if (!updatedCoworkSpace) {
      return res
        .status(404)
        .send({ message: 'Coworking space property not found or updated' });
    }

    res.status(200).send(updatedCoworkSpace);
    return;
  } else {
    res.status(500).send({ message: 'Property type not specified' });
    return;
  }
};

/* ============================================================= DELETE PROPERTY ============================================================= */
exports.deleteProperty = async (req, res) => {
  const [prop, propErr] = await common.p2r(
    Property.findByIdAndDelete(req.params.id)
  );

  if (propErr) {
    res.status(500).send({
      message: 'An error occurred while deleting property',
      error: propErr,
    });
    return;
  }

  if (!prop) {
    res.status(404).send({ message: 'Property not found' });
    return;
  }

  const [features, featuresErr] = await common.p2r(
    PropertyFeatures.findByIdAndDelete(prop.features)
  );

  if (featuresErr) {
    res.status(500).send({
      message: 'An error occurred while deleting features of property',
      error: featuresErr,
    });
    return;
  }

  // if (!features) {
  //   res.status(404).send({ message: 'Property features not found' });
  //   return;
  // }

  let ignoreType = ['coliving space', 'coworking space']

  if (!ignoreType.includes(prop.purpose) && prop.type.toLowerCase() === 'residential') {
    const [resProp, resErr] = await common.p2r(
      ResProperty.findOneAndDelete({
        property: req.params.id,
      })
    );

    if (resErr) {
      res.status(500).send({
        message: 'An error occurred while deleting residential property',
        error: resErr,
      });
      return;
    }

    if (!resProp) {
      res
        .status(404)
        .send({ message: 'Residential property not found', property: prop });
      return;
    }

    resProp.property = prop;

    res.status(200).send({
      message: 'Residential property deleted successfully',
      property: resProp,
    });
    return;
  } else if (!ignoreType.includes(prop.purpose) && prop.type.toLowerCase() === 'commercial') {
    const [commProp, commErr] = await common.p2r(
      CommProperty.findOneAndDelete({
        property: req.params.id,
      })
    );

    if (commErr) {
      res.status(500).send({
        message: 'An error occurred while deleting commercial property',
        error: commErr,
      });
      return;
    }

    if (!commProp) {
      res
        .status(404)
        .send({ message: 'Commercial property not found', property: prop });
      return;
    }

    commProp.property = prop;

    res.status(200).send({
      message: 'Commercial property deleted successfully',
      property: commProp,
    });
    return;
  } else if (!ignoreType.includes(prop.purpose) && prop.type.toLowerCase() === 'plot') {
    const [plotProp, plotErr] = await common.p2r(
      PlotProperty.findOneAndDelete({
        property: req.params.id,
      })
    );

    if (plotErr) {
      res.status(500).send({
        message: 'An error occurred while deleting plot property',
        error: plotErr,
      });
      return;
    }

    if (!plotProp) {
      res
        .status(404)
        .send({ message: 'Plot property not found', property: prop });
      return;
    }

    plotProp.property = prop;

    res.status(200).send({
      message: 'Plot property deleted successfully',
      property: plotProp,
    });
    return;
  } else if (prop.purpose.toLowerCase() === 'coliving space') {
    const [colivSpace, colivErr] = await common.p2r(
      ColivingSpace.findOneAndDelete({
        property: req.params.id,
      })
    );

    if (colivErr) {
      res.status(500).send({
        message: 'An error occurred while deleting coliving space property',
        error: colivErr,
      });
      return;
    }

    if (!colivSpace) {
      res.status(404).send({
        message: 'Coliving space property not found',
        property: prop,
      });
      return;
    }

    colivSpace.property = prop;

    res.status(200).send({
      message: 'Coliving space property deleted successfully',
      property: colivSpace,
    });
    return;
  } else if (prop.purpose.toLowerCase() === 'coworking space') {
    const [coworkSpace, coworkErr] = await common.p2r(
      CoworkingSpace.findOneAndDelete({
        property: req.params.id,
      })
    );

    if (coworkErr) {
      res.status(500).send({
        message: 'An error occurred while deleting coworking space property',
        error: coworkErr,
      });
      return;
    }

    if (!coworkSpace) {
      res.status(404).send({
        message: 'Coworking space property not found',
        property: prop,
      });
      return;
    }

    coworkSpace.property = prop;

    res.status(200).send({
      message: 'Coworking space property deleted successfully',
      property: coworkSpace,
    });
    return;
  } else {
    res.status(500).send({ message: 'Property type not specified' });
    return;
  }
};

/* ============================================================= GET ONE PROPERTY ============================================================= */
exports.getProperty = async (req, res) => {
  const [prop, err] = await common.p2r(Property.findById(req.params.id));
  if (err) {
    res.status(500).send({
      message: 'An error occurred while finding property',
      error: err,
    });
    return;
  }

  if (!prop) {
    res.status(404).send({ message: 'Property not found' });
    return;
  }

  let ignoreType = ['coliving space', 'coworking space']

  if (!ignoreType.includes(prop.purpose) && prop.type === 'residential') {
    const [propWithType, err] = await common.p2r(
      ResProperty.findOne({
        property: prop._id,
      }).populate({
        path: 'property',
        populate: {
          path: 'user',
          model: 'User',
          select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
        },
        populate: {
          path: 'features',
          model: 'PropertyFeatures',
        }
      })
    );

    if (err) {
      res.status(500).send({
        message: 'An error occurred while finding residential property',
        error: err,
      });
      return;
    }

    if (!propWithType) {
      res.status(404).send({ message: 'Residential property not found' });
      return;
    }

    res.status(200).send(propWithType);
    return;
  } else if (!ignoreType.includes(prop.purpose) && prop.type === 'commercial') {
    const [propWithType, err] = await common.p2r(
      CommProperty.findOne({
        property: prop._id,
      }).populate({
        path: 'property',
        populate: {
          path: 'user',
          model: 'User',
          select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
        },
        populate: {
          path: 'features',
          model: 'PropertyFeatures',
        }
      })
    );

    if (err) {
      res.status(500).send({
        message: 'An error occurred while finding commercial property',
        error: err,
      });
      return;
    }

    if (!propWithType) {
      res.status(404).send({ message: 'Commercial property not found' });
      return;
    }

    res.status(200).send(propWithType);
    return;
  } else if (!ignoreType.includes(prop.purpose) && prop.type === 'plot') {
    const [propWithType, err] = await common.p2r(
      PlotProperty.findOne({
        property: prop._id,
      }).populate({
        path: 'property',
        populate: {
          path: 'user',
          model: 'User',
          select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
        },
        populate: {
          path: 'features',
          model: 'PropertyFeatures',
        }
      })
    );

    if (err) {
      res.status(500).send({
        message: 'An error occurred while finding plot property',
        error: err,
      });
      return;
    }

    if (!propWithType) {
      res.status(404).send({ message: 'Plot property not found' });
      return;
    }

    res.status(200).send(propWithType);
    return;
  } else if (prop.purpose === 'coliving space') {
    const [propWithType, err] = await common.p2r(
      ColivingSpace.findOne({
        property: prop._id,
      }).populate({
        path: 'property',
        populate: {
          path: 'user',
          model: 'User',
          select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
        },
        populate: {
          path: 'features',
          model: 'PropertyFeatures',
        }
      })
    );

    if (err) {
      res.status(500).send({
        message: 'An error occurred while finding plot property',
        error: err,
      });
      return;
    }

    if (!propWithType) {
      res.status(404).send({ message: 'Coliving space property not found' });
      return;
    }

    res.status(200).send(propWithType);
    return;
  } else if (prop.purpose === 'coworking space') {
    const [propWithType, err] = await common.p2r(
      CoworkingSpace.findOne({
        property: prop._id,
      }).populate({
        path: 'property',
        populate: {
          path: 'user',
          model: 'User',
          select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
        },
        populate: {
          path: 'features',
          model: 'PropertyFeatures',
        }
      })
    );

    if (err) {
      res.status(500).send({
        message: 'An error occurred while finding plot property',
        error: err,
      });
      return;
    }

    if (!propWithType) {
      res.status(404).send({ message: 'Coworking space property not found' });
      return;
    }

    res.status(200).send(propWithType);
    return;
  } else {
    res
      .status(200)
      .send({ message: 'Property type not specified', property: prop });
    return;
  }
};

/* ============================================================= GET ALL PROPERTIES ============================================================= */
exports.getAllProperties = async (req, res) => {
  var allProp = [];
  let filterOptions = {};
  let propertyFilterOptions = {};
  let sortOptions = {};

  applyFilters(filterOptions, propertyFilterOptions, req);
  applySort(sortOptions, req);

  const [resProps, resErr] = await common.p2r(
    // ResProperty.find().populate('property')
    ResProperty.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      populate: {
        path: 'user',
        model: 'User',
        select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
      }
    })
  );

  if (resErr) {
    res.status(500).send({
      message: 'An error occurred while getting residential properties',
      error: resErr,
    });
    return;
  }

  // if (!resProps) {
  //   res.status(500).send({ message: 'No residential properties found' });
  //   return;
  // }

  allProp = allProp.concat(resProps);

  const [commProps, commErr] = await common.p2r(
    CommProperty.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      populate: {
        path: 'user',
        model: 'User',
        select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
      }
    })
  );

  if (commErr) {
    res.status(500).send({
      message: 'An error occurred while getting commercial properties',
      error: commErr,
    });
    return;
  }

  // if (!commProps) {
  //   res.status(500).send({ message: 'No commerical properties found' });
  //   return;
  // }

  allProp = allProp.concat(commProps);

  const [plotProps, plotErr] = await common.p2r(
    PlotProperty.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      populate: {
        path: 'user',
        model: 'User',
        select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
      }
    })
  );

  if (plotErr) {
    res.status(500).send({
      message: 'An error occurred while getting plot properties',
      error: plotErr,
    });
    return;
  }

  // if (!plotProps) {
  //   res.status(500).send({ message: 'No plot properties found' });
  //   return;
  // }

  allProp = allProp.concat(plotProps);

  const [colivSpaces, colivErr] = await common.p2r(
    ColivingSpace.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      populate: {
        path: 'user',
        model: 'User',
        select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
      }
    })
  );

  if (colivErr) {
    res.status(500).send({
      message: 'An error occurred while getting coliving space properties',
      error: colivErr,
    });
    return;
  }

  // if (!colivSpaces) {
  //   res.status(500).send({ message: 'No coliving space properties found' });
  //   return;
  // }

  allProp = allProp.concat(colivSpaces);

  const [coworkSpaces, coworkErr] = await common.p2r(
    CoworkingSpace.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      populate: {
        path: 'user',
        model: 'User',
        select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
      }
    })
  );

  if (coworkErr) {
    res.status(500).send({
      message: 'An error occurred while getting coworking space properties',
      error: coworkErr,
    });
    return;
  }

  // if (!coworkSpaces) {
  //   res.status(500).send({ message: 'No coworking space properties found' });
  //   return;
  // }

  allProp = allProp.concat(coworkSpaces);

  allProp =  allProp.filter(p => p.property !== null && p.property?.user);

  if(req.query?.sort) applyAllPropertySort(allProp, req.query?.sort)

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL POINTS ============================================================= */
exports.getAllPoints = async (req, res) => {

  let propertiesFields = '_id title geoLocation images createdAt purpose type city location areaSize'
  let filterFields = '_id address noOfBedrooms noOfBathrooms subtype price'

  var allProp = [];
  let filterOptions = {};
  let propertyFilterOptions = {};
  let sortOptions = {};

  applyFilters(filterOptions, propertyFilterOptions, req);
  applySort(sortOptions, req);

  const [resProps, resErr] = await common.p2r(
    ResProperty.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      select: propertiesFields
    }).select(filterFields)
  );

  if (resErr) {
    res.status(500).send({
      message: 'An error occurred while getting residential properties',
      error: resErr,
    });
    return;
  }

  // if (!resProps) {
  //   res.status(500).send({ message: 'No residential properties found' });
  //   return;
  // }

  allProp = allProp.concat(resProps);

  const [commProps, commErr] = await common.p2r(
    CommProperty.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      select: propertiesFields
    }).select(filterFields)
  );

  if (commErr) {
    res.status(500).send({
      message: 'An error occurred while getting commercial properties',
      error: commErr,
    });
    return;
  }

  // if (!commProps) {
  //   res.status(500).send({ message: 'No commerical properties found' });
  //   return;
  // }

  allProp = allProp.concat(commProps);

  const [plotProps, plotErr] = await common.p2r(
    PlotProperty.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      select: propertiesFields
    }).select(filterFields)
  );

  if (plotErr) {
    res.status(500).send({
      message: 'An error occurred while getting plot properties',
      error: plotErr,
    });
    return;
  }

  // if (!plotProps) {
  //   res.status(500).send({ message: 'No plot properties found' });
  //   return;
  // }

  allProp = allProp.concat(plotProps);

  const [colivSpaces, colivErr] = await common.p2r(
    ColivingSpace.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      select: propertiesFields
    }).select(filterFields)
  );

  if (colivErr) {
    res.status(500).send({
      message: 'An error occurred while getting coliving space properties',
      error: colivErr,
    });
    return;
  }

  // if (!colivSpaces) {
  //   res.status(500).send({ message: 'No coliving space properties found' });
  //   return;
  // }

  allProp = allProp.concat(colivSpaces);

  const [coworkSpaces, coworkErr] = await common.p2r(
    CoworkingSpace.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      select: propertiesFields
    }).select(filterFields)
  );

  if (coworkErr) {
    res.status(500).send({
      message: 'An error occurred while getting coworking space properties',
      error: coworkErr,
    });
    return;
  }

  // if (!coworkSpaces) {
  //   res.status(500).send({ message: 'No coworking space properties found' });
  //   return;
  // }

  allProp = allProp.concat(coworkSpaces);

  allProp =  allProp.filter(p => p.property !== null);

  // if(req.query?.sort) applyAllPropertySort(allProp, req.query?.sort)

  // allProp = common.paginateArray(
  //   allProp,
  //   req.query.pageNumber,
  //   req.query.nPerPage
  // );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL RESIDENTIAL PROPERTIES ============================================================= */
exports.getAllResidentialProperties = async (req, res) => {
  let allProp = [];
  let filterOptions = {};
  let propertyFilterOptions = {};
  let sortOptions = {};

  applyFilters(filterOptions, propertyFilterOptions, req);
  applySort(sortOptions, req);

  const [resProps, resErr] = await common.p2r(
    ResProperty.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      populate: {
        path: 'user',
        model: 'User',
        select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
      },
    })
  );

  if (resErr) {
    res.status(500).send({
      message: 'An error occurred while getting residential properties',
      error: resErr,
    });
    return;
  }

  allProp = allProp.concat(resProps);

  allProp =  allProp.filter(p => p.property !== null && p.property?.user)

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL COMMERCIAL PROPERTIES ============================================================= */
exports.getAllCommercialProperties = async (req, res) => {
  let allProp = [];
  let filterOptions = {};
  let propertyFilterOptions = {};
  let sortOptions = {};

  applyFilters(filterOptions, propertyFilterOptions, req);
  applySort(sortOptions, req);

  const [resProps, resErr] = await common.p2r(
    CommProperty.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      populate: {
        path: 'user',
        model: 'User',
        select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
      }
    })
  );

  if (resErr) {
    res.status(500).send({
      message: 'An error occurred while getting commercial properties',
      error: resErr,
    });
    return;
  }

  allProp = allProp.concat(resProps);

  allProp =  allProp.filter(p => p.property !== null && p.property?.user)

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL PLOT PROPERTIES ============================================================= */
exports.getAllPlotProperties = async (req, res) => {

  let allProp = [];
  let filterOptions = {};
  let propertyFilterOptions = {};
  let sortOptions = {};

  applyFilters(filterOptions, propertyFilterOptions, req);
  applySort(sortOptions, req);

  const [resProps, resErr] = await common.p2r(
    PlotProperty.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      populate: {
        path: 'user',
        model: 'User',
        select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
      }
    })
  );

  if (resErr) {
    res.status(500).send({
      message: 'An error occurred while getting plot properties',
      error: resErr,
    });
    return;
  }

  allProp = allProp.concat(resProps);

  allProp =  allProp.filter(p => p.property !== null && p.property?.user)

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL COLIVING SPACE PROPERTIES ============================================================= */
exports.getAllColivingSpaceProperties = async (req, res) => {
  let allProp = [];
  let filterOptions = {};
  let propertyFilterOptions = {};
  let sortOptions = {};

  applyFilters(filterOptions, propertyFilterOptions, req);
  applySort(sortOptions, req);

  const [resProps, resErr] = await common.p2r(
    ColivingSpace.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      populate: {
        path: 'user',
        model: 'User',
        select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
      }
    })
  );

  if (resErr) {
    res.status(500).send({
      message: 'An error occurred while getting coliving space properties',
      error: resErr,
    });
    return;
  }

  allProp = allProp.concat(resProps);

  allProp =  allProp.filter(p => p.property !== null && p.property?.user)

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL COWORKING SPACE PROPERTIES ============================================================= */
exports.getAllCoworkingSpaceProperties = async (req, res) => {
  let allProp = [];
  let filterOptions = {};
  let propertyFilterOptions = {};
  let sortOptions = {};

  applyFilters(filterOptions, propertyFilterOptions, req);
  applySort(sortOptions, req);

  const [resProps, resErr] = await common.p2r(
    CoworkingSpace.find(filterOptions).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
      populate: {
        path: 'user',
        model: 'User',
        select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
      }
    })
  );

  if (resErr) {
    res.status(500).send({
      message: 'An error occurred while getting coworking space properties',
      error: resErr,
    });
    return;
  }

  allProp = allProp.concat(resProps);

  allProp =  allProp.filter(p => p.property !== null && p.property?.user)

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL PROPERTIES OF USER ============================================================= */
exports.getAllPropertiesOfUser = async (req, res) => {
  var allProp = [];
  let filterOptions = {};
  let propertyFilterOptions = {};
  let sortOptions = {};

  applyFilters(filterOptions, propertyFilterOptions, req);
  applySort(sortOptions, req);


  // Getting ids all all user properties
  const pQuery = {
    $or: [
      { user: req.params.id },
      { staff: req.params.id }
    ]
  };
  const [props, propsErr] = await common.p2r(
    Property.find(pQuery)
  );

  if (propsErr) {
    res.status(500).send({
      message: 'An error occurred while getting properties of user',
      error: propsErr,
    });
    return;
  }

  let ids = props.map((proplisting) => proplisting.id);
  // =============================

  const [resProps, resErr] = await common.p2r(
    ResProperty.find({
      property: { $in: ids },
      ...filterOptions
    }).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
    })
  );

  if (resErr) {
    res.status(500).send({
      message: 'An error occurred while getting residential properties',
      error: resErr,
    });
    return;
  }

  allProp = allProp.concat(resProps);

  const [commProps, commErr] = await common.p2r(
    CommProperty.find({
      property: { $in: ids },
      ...filterOptions
    }).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
    })
  );

  if (commErr) {
    res.status(500).send({
      message: 'An error occurred while getting commercial properties',
      error: commErr,
    });
    return;
  }

  allProp = allProp.concat(commProps);

  const [plotProps, plotErr] = await common.p2r(
    PlotProperty.find({
      property: { $in: ids },
      ...filterOptions
    }).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
    })
  );

  if (plotErr) {
    res.status(500).send({
      message: 'An error occurred while getting plot properties',
      error: plotErr,
    });
    return;
  }

  allProp = allProp.concat(plotProps);

  const [colivSpaces, colivErr] = await common.p2r(
    ColivingSpace.find({
      property: { $in: ids },
      ...filterOptions
    }).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
    })
  );

  if (colivErr) {
    res.status(500).send({
      message: 'An error occurred while getting coliving space properties',
      error: colivErr,
    });
    return;
  }

  allProp = allProp.concat(colivSpaces);

  const [coworkSpaces, coworkErr] = await common.p2r(
    CoworkingSpace.find({
      property: { $in: ids },
      ...filterOptions
    }).sort(sortOptions).populate({
      path: 'property',
      match: propertyFilterOptions,
    })
  );

  if (coworkErr) {
    res.status(500).send({
      message: 'An error occurred while getting coworking space properties',
      error: coworkErr,
    });
    return;
  }

  allProp = allProp.concat(coworkSpaces);

  allProp =  allProp.filter(p => p.property !== null);
  if(req.query?.sort) applyAllPropertySort(allProp, req.query?.sort)

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL RES PROPERTIES OF USER ============================================================= */
exports.getAllResPropertiesOfUser = async (req, res) => {
  var allProp = [];

  const [props, propsErr] = await common.p2r(
    Property.find({ user: req.params.id })
  );

  if (propsErr) {
    res.status(500).send({
      message: 'An error occurred while getting properties of user',
      error: propsErr,
    });
    return;
  }

  let ids = props.map((proplisting) => proplisting.id);

  const [resProps, resErr] = await common.p2r(
    ResProperty.find({
      property: { $in: ids },
    }).populate('property')
  );

  if (resErr) {
    res.status(500).send({
      message: 'An error occurred while getting residential properties',
      error: resErr,
    });
    return;
  }

  allProp = allProp.concat(resProps);

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL COM PROPERTIES OF USER ============================================================= */
exports.getAllComPropertiesOfUser = async (req, res) => {
  var allProp = [];

  const [props, propsErr] = await common.p2r(
    Property.find({ user: req.params.id })
  );

  if (propsErr) {
    res.status(500).send({
      message: 'An error occurred while getting properties of user',
      error: propsErr,
    });
    return;
  }

  let ids = props.map((proplisting) => proplisting.id);

  const [commProps, commErr] = await common.p2r(
    CommProperty.find({
      property: { $in: ids },
    }).populate('property')
  );

  if (commErr) {
    res.status(500).send({
      message: 'An error occurred while getting commercial properties',
      error: commErr,
    });
    return;
  }

  allProp = allProp.concat(commProps);

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL PLOT PROPERTIES OF USER ============================================================= */
exports.getAllPlotPropertiesOfUser = async (req, res) => {
  var allProp = [];

  const [props, propsErr] = await common.p2r(
    Property.find({ user: req.params.id })
  );

  if (propsErr) {
    res.status(500).send({
      message: 'An error occurred while getting properties of user',
      error: propsErr,
    });
    return;
  }

  let ids = props.map((proplisting) => proplisting.id);

  const [plotProps, plotErr] = await common.p2r(
    PlotProperty.find({
      property: { $in: ids },
    }).populate('property')
  );

  if (plotErr) {
    res.status(500).send({
      message: 'An error occurred while getting plot properties',
      error: plotErr,
    });
    return;
  }

  allProp = allProp.concat(plotProps);

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL COLIVING PROPERTIES OF USER ============================================================= */
exports.getAllCoLivingPropertiesOfUser = async (req, res) => {
  var allProp = [];

  const [props, propsErr] = await common.p2r(
    Property.find({ user: req.params.id })
  );

  if (propsErr) {
    res.status(500).send({
      message: 'An error occurred while getting properties of user',
      error: propsErr,
    });
    return;
  }

  let ids = props.map((proplisting) => proplisting.id);

  const [colivSpaces, colivErr] = await common.p2r(
    ColivingSpace.find({
      property: { $in: ids },
    }).populate('property')
  );

  if (colivErr) {
    res.status(500).send({
      message: 'An error occurred while getting coliving space properties',
      error: colivErr,
    });
    return;
  }

  allProp = allProp.concat(colivSpaces);

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL COWORKING PROPERTIES OF USER ============================================================= */
exports.getAllCoWorkingPropertiesOfUser = async (req, res) => {
  var allProp = [];

  const [props, propsErr] = await common.p2r(
    Property.find({ user: req.params.id })
  );

  if (propsErr) {
    res.status(500).send({
      message: 'An error occurred while getting properties of user',
      error: propsErr,
    });
    return;
  }

  let ids = props.map((proplisting) => proplisting.id);

  const [coworkSpaces, coworkErr] = await common.p2r(
    CoworkingSpace.find({
      property: { $in: ids },
    }).populate('property')
  );

  if (coworkErr) {
    res.status(500).send({
      message: 'An error occurred while getting coworking space properties',
      error: coworkErr,
    });
    return;
  }

  allProp = allProp.concat(coworkSpaces);

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= ADD FEATURES OF PROPERTY ============================================================= */
exports.addFeaturesOfProperty = async (req, res) => {
  const features = new PropertyFeatures({
    // main features
    builtInYear: req.body.builtInYear,
    bed: req.body.bed,
    airConditioner: req.body.airConditioner,
    heater: req.body.heater,
    facing: req.body.facing,
    totalCapacity: req.body.totalCapacity,
    highSpeedInternet: req.body.highSpeedInternet,
    parkingSpaces: req.body.parkingSpaces,
    publicParking: req.body.publicParking,
    undergroundParking: req.body.undergroundParking,
    attachedBathroom: req.body.attachedBathroom,
    attachedBalcony: req.body.attachedBalcony,
    lobbyInBuilding: req.body.lobbyInBuilding,
    elevators: req.body.elevators,
    serviceElevatorsInBuilding: req.body.serviceElevatorsInBuilding,
    elevatorOrLift: req.body.elevatorOrLift,
    doubleGlazedWindows: req.body.doubleGlazedWindows,
    centralAirConditioning: req.body.centralAirConditioning,
    centralHeating: req.body.centralHeating,
    flooring: req.body.flooring,
    electricityBackup: req.body.electricityBackup,
    wasteDisposal: req.body.wasteDisposal,
    totalFloors: req.body.totalFloors,
    cornerProperty: req.body.cornerProperty,
    gatedCommunity: req.body.gatedCommunity,
    otherMainFeatures: req.body.otherMainFeatures,

    // main features (2)
    noOfUnits: req.body.noOfUnits,
    possession: req.body.possession,
    parkFacing: req.body.parkFacing,
    disputed: req.body.disputed,
    file: req.body.file,
    balloted: req.body.balloted,
    sewerage: req.body.sewerage,
    boundaryWall: req.body.boundaryWall,
    extraLand: req.body.extraLand,
    mainBoulevard: req.body.mainBoulevard,
    irrigation: req.body.irrigation,
    tubeWells: req.body.tubeWells,
    accessibleByRoad: req.body.accessibleByRoad,
    parameterFencing: req.body.parameterFencing,
    landFertility: req.body.landFertility,
    boundaryLines: req.body.boundaryLines,
    nearbyWaterResources: req.body.nearbyWaterResources,
    otherPlotFeatures: req.body.otherPlotFeatures,

    // main features (3)
    wifi: req.body.wifi,
    washingMachine: req.body.washingMachine,
    fridge: req.body.fridge,
    cupboard: req.body.cupboard,
    microwave: req.body.microwave,
    tableAndChair: req.body.tableAndChair,
    dailyCleaningService: req.body.dailyCleaningService,
    inhousePrinting: req.body.inhousePrinting,
    inhouseScanning: req.body.inhouseScanning,
    inhouseCopying: req.body.inhouseCopying,
    inhouseProjector: req.body.inhouseProjector,
    operationalHours: req.body.operationalHours,
    prayerArea: req.body.prayerArea,
    lockers: req.body.lockers,
    utilities: req.body.utilities,
    electricity: req.body.electricity,
    gas: req.body.gas,
    water: req.body.water,
    maintenance: req.body.maintenance,

    // business and communication
    broadbandInternetAccess: req.body.broadbandInternetAccess,
    //satelliteOrCable: req.body.satelliteOrCable,
    businessCenterOrMediaRoom: req.body.businessCenterOrMediaRoom,
    intercom: req.body.intercom,
    atmMachines: req.body.atmMachines,
    otherBusinessAndCommunicationFeatures:
      req.body.otherBusinessAndCommunicationFeatures,
    conferenceRoomInBuilding: req.body.conferenceRoomInBuilding,

    // rooms
    bathrooms: req.body.bathrooms,
    servantsQuarters: req.body.servantsQuarters,
    drawingRoom: req.body.drawingRoom,
    diningRoom: req.body.diningRoom,
    kitchen: req.body.kitchen,
    studyRoom: req.body.studyRoom,
    prayerRoom: req.body.prayerRoom,
    powderRoom: req.body.powderRoom,
    gym: req.body.gym,
    storeRoom: req.body.storeRoom,
    steamRoom: req.body.steamRoom,
    loungeOrSittingRoom: req.body.loungeOrSittingRoom,
    laundryRoom: req.body.laundryRoom,
    otherRooms: req.body.otherRooms,

    // community features
    communityLawnOrGarden: req.body.communityLawnOrGarden,
    communitySwimmingPool: req.body.communitySwimmingPool,
    communityGym: req.body.communityGym,
    firstAidOrMedicalCenter: req.body.firstAidOrMedicalCenter,
    dayCareCenter: req.body.dayCareCenter,
    kidsPlayArea: req.body.kidsPlayArea,
    barbecueArea: req.body.barbecueArea,
    mosque: req.body.mosque,
    communityCenter: req.body.communityCenter,
    otherCommunityFeatures: req.body.otherCommunityFeatures,

    // nearby locations
    nearbySchools: req.body.nearbySchools,
    nearbyHospitals: req.body.nearbyHospitals,
    nearbyShoppingMalls: req.body.nearbyShoppingMalls,
    nearbyRestaurants: req.body.nearbyRestaurants,
    distanceFromAirport: req.body.distanceFromAirport,
    nearbyPublicTransport: req.body.nearbyPublicTransport,
    otherNearbyPlaces: req.body.otherNearbyPlaces,

    // other facilities
    maintenanceStaff: req.body.maintenanceStaff,
    securityStaff: req.body.securityStaff,
    laundryOrDryCleaning: req.body.laundryOrDryCleaning,
    communalOrSharedKitchen: req.body.communalOrSharedKitchen,
    facilitiesForDisabled: req.body.facilitiesForDisabled,
    petPolicy: req.body.petPolicy,
    cctvSecurity: req.body.cctvSecurity,
    otherFacilities: req.body.otherFacilities,
    cafeteria: req.body.cafeteria,
    supportStaff: req.body.supportStaff,
    frontDeskStaff: req.body.frontDeskStaff,
    teaOrCoffee: req.body.teaOrCoffee,
    drinkingWater: req.body.drinkingWater,
    diningArea: req.body.diningArea,
    indoorGames: req.body.indoorGames,
    lawn: req.body.lawn,
    indoorGym: req.body.indoorGym,
    washrooms: req.body.washrooms,

    // healthcare and recreational
    lawnOrGarden: req.body.lawnOrGarden,
    swimmingPool: req.body.swimmingPool,
    sauna: req.body.sauna,
    jacuzzi: req.body.jacuzzi,
    otherHealthcareAndRecreationalFeatures:
      req.body.otherHealthcareAndRecreationalFeatures,
    cricketGround: req.body.cricketGround,
    footballGround: req.body.footballGround,
    carromBoard: req.body.carromBoard,
    tableTennis: req.body.tableTennis,
    snooker: req.body.snooker,
    barbecueArea: req.body.barbecueArea,
    bonfireArea: req.body.bonfireArea,
  });

  const [addedFeatures, featuresErr] = await common.p2r(features.save());

  if (featuresErr) {
    res.status(500).send({
      message: 'An error occurred while adding property features',
      error: featuresErr,
    });
    return;
  }

  if (!addedFeatures) {
    res.status(500).send({ message: 'Property features not added' });
    return;
  }

  const [prop, propErr] = await common.p2r(
    Property.findByIdAndUpdate(
      req.params.id,
      {
        features: addedFeatures._id,
      },
      {
        new: true,
        runValidators: true,
      }
    )
  );

  if (propErr) {
    res.status(500).send({
      message:
        'An error occurred while updating property with newly added features',
      error: propErr,
    });
    return;
  }

  if (!prop) {
    res.status(404).send({ message: 'Property not found or updated' });
    return;
  }

  let ignoreType = ['coliving space', 'coworking space']
  if (!ignoreType.includes(prop.purpose) && prop.type.toLowerCase() === 'residential') {
    const [resProp, resErr] = await common.p2r(
      ResProperty.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (resErr) {
      res.status(500).send({
        message: 'An error occurred while finding residential property',
        error: resErr,
      });
      return;
    }

    if (!resProp) {
      res.status(404).send({ message: 'Residential property not found' });
      return;
    }

    resProp.property.features = addedFeatures;

    res.status(200).send(resProp);
    return;
  } else if (!ignoreType.includes(prop.purpose) && prop.type.toLowerCase() === 'commercial') {
    const [commProp, commErr] = await common.p2r(
      CommProperty.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (commErr) {
      res.status(500).send({
        message: 'An error occurred while finding commercial property',
        error: commErr,
      });
      return;
    }

    if (!commProp) {
      res.status(404).send({ message: 'Commercial property not found' });
      return;
    }

    commProp.property.features = addedFeatures;

    res.status(200).send(commProp);
    return;
  } else if (!ignoreType.includes(prop.purpose) && prop.type.toLowerCase() === 'plot') {
    const [plotProp, plotErr] = await common.p2r(
      PlotProperty.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (plotErr) {
      res.status(500).send({
        message: 'An error occurred while finding plot property',
        error: plotErr,
      });
      return;
    }

    if (!plotProp) {
      res.status(404).send({ message: 'Plot property not found' });
      return;
    }

    plotProp.property.features = addedFeatures;

    res.status(200).send(plotProp);
    return;
  } else if (prop.purpose.toLowerCase() === 'coliving space') {
    const [colivSpace, colivErr] = await common.p2r(
      ColivingSpace.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (colivErr) {
      res.status(500).send({
        message: 'An error occurred while finding coliving space property',
        error: colivErr,
      });
      return;
    }

    if (!colivSpace) {
      res.status(404).send({ message: 'Coliving space property not found' });
      return;
    }

    colivSpace.property.features = addedFeatures;

    res.status(200).send(colivSpace);
    return;
  } else if (prop.purpose.toLowerCase() === 'coworking space') {
    const [coworkSpace, coworkErr] = await common.p2r(
      CoworkingSpace.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (coworkErr) {
      res.status(500).send({
        message: 'An error occurred while finding coworking space property',
        error: coworkErr,
      });
      return;
    }

    if (!coworkSpace) {
      res.status(404).send({ message: 'Coworking space property not found' });
      return;
    }

    coworkSpace.property.features = addedFeatures;

    res.status(200).send(coworkSpace);
    return;
  } else {
    res.status(500).send({ message: 'Property type not specified' });
    return;
  }
};

/* ============================================================= UPDATE FEATURES OF PROPERTY ============================================================= */
exports.updateFeaturesOfProperty = async (req, res) => {
  const [prop, propErr] = await common.p2r(Property.findById(req.params.id));

  if (propErr) {
    res.status(500).send({
      message: 'An error occurred while finding property',
      error: propErr,
    });
    return;
  }

  if (!prop) {
    res.status(404).send({ message: 'Property not found' });
    return;
  }

  const [addedFeatures, addFeaturesErr] = await common.p2r(
    PropertyFeatures.findByIdAndUpdate(prop.features, req.body, {
      new: true,
      runValidators: true,
    })
  );

  if (addFeaturesErr) {
    res.status(500).send({
      message: 'An error occurred while updating property features',
      error: addFeaturesErr,
    });
    return;
  }

  if (!addedFeatures) {
    res.status(404).send({
      message: 'Property features not found or updated',
    });
    return;
  }

  let ignoreType = ['coliving space', 'coworking space']

  if (!ignoreType.includes(prop.purpose) && prop.type.toLowerCase() === 'residential') {
    const [resProp, resErr] = await common.p2r(
      ResProperty.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (resErr) {
      res.status(500).send({
        message: 'An error occurred while finding residential property',
        error: resErr,
      });
      return;
    }

    if (!resProp) {
      res.status(404).send({ message: 'Residential property not found' });
      return;
    }

    resProp.property.features = addedFeatures;

    res.status(200).send(resProp);
    return;
  } else if (!ignoreType.includes(prop.purpose) && prop.type.toLowerCase() === 'commercial') {
    const [commProp, commErr] = await common.p2r(
      CommProperty.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (commErr) {
      res.status(500).send({
        message: 'An error occurred while finding commercial property',
        error: commErr,
      });
      return;
    }

    if (!commProp) {
      res.status(404).send({ message: 'Commercial property not found' });
      return;
    }

    commProp.property.features = addedFeatures;

    res.status(200).send(commProp);
    return;
  } else if (!ignoreType.includes(prop.purpose) && prop.type.toLowerCase() === 'plot') {
    const [plotProp, plotErr] = await common.p2r(
      PlotProperty.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (plotErr) {
      res.status(500).send({
        message: 'An error occurred while finding plot property',
        error: plotErr,
      });
      return;
    }

    if (!plotProp) {
      res.status(404).send({ message: 'Plot property not found' });
      return;
    }

    plotProp.property.features = addedFeatures;

    res.status(200).send(plotProp);
    return;
  } else if (prop.purpose.toLowerCase() === 'coliving space') {
    const [colivSpace, colivErr] = await common.p2r(
      ColivingSpace.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (colivErr) {
      res.status(500).send({
        message: 'An error occurred while finding coliving space property',
        error: colivErr,
      });
      return;
    }

    if (!colivSpace) {
      res.status(404).send({ message: 'Coliving space property not found' });
      return;
    }

    colivSpace.property.features = addedFeatures;

    res.status(200).send(colivSpace);
    return;
  } else if (prop.purpose.toLowerCase() === 'coworking space') {
    const [coworkSpace, coworkErr] = await common.p2r(
      CoworkingSpace.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (coworkErr) {
      res.status(500).send({
        message: 'An error occurred while finding coworking space property',
        error: coworkErr,
      });
      return;
    }

    if (!coworkSpace) {
      res.status(404).send({ message: 'Coworking space property not found' });
      return;
    }

    coworkSpace.property.features = addedFeatures;

    res.status(200).send(coworkSpace);
    return;
  } else {
    res.status(500).send({ message: 'Property type not specified' });
    return;
  }
};

/* ============================================================= GET FEATURES OF PROPERTY ============================================================= */
exports.getFeaturesOfProperty = async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);

    if (!prop) {
      res.status(404).send({ message: 'Property not found' });
      return;
    }

    try {
      const features = await PropertyFeatures.findById(prop.features);

      if (!features) {
        res
          .status(500)
          .send({ message: 'This property does not have any features' });
        return;
      }

      res.status(200).send(features);
      return;
    } catch (err) {}
  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
};

/* ============================================================= GET PROPERTY WITH FEATURES ============================================================= */
exports.getPropertyWithFeatures = async (req, res) => {
  const [prop, propErr] = await common.p2r(Property.findById(req.params.id));

  if (propErr) {
    res.status(500).send({
      message: 'An error occurred while getting property',
      error: propErr,
    });
    return;
  }

  if (!prop) {
    res.status(404).send({ message: 'Property not found' });
    return;
  }

  const [features, featuresErr] = await common.p2r(
    PropertyFeatures.findOne({
      property: req.params.id,
    })
  );

  if (featuresErr) {
    res.status(500).send({
      message: 'An error occurred while getting property features',
      error: featuresErr,
    });
    return;
  }

  // if (!features) {
  //   res
  //     .status(500)
  //     .send({ message: 'This property does not have any features' });
  //   return;
  // }

  let ignoreType = ['coliving space', 'coworking space']

  if (!ignoreType.includes(prop.purpose) && prop.type === 'residential') {
    const [propWithType, propTypeErr] = await common.p2r(
      ResProperty.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (propTypeErr) {
      res.status(500).send({
        message: 'An error occurred while getting property features',
        error: propTypeErr,
      });
      return;
    }

    if (!propWithType) {
      res.status(404).send({ message: 'Residential property not found' });
      return;
    }

    res.status(200).send(propWithType);
    return;
  } else if (!ignoreType.includes(prop.purpose) && prop.type === 'commercial') {
    const [propWithType, propTypeErr] = await common.p2r(
      CommProperty.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (propTypeErr) {
      res.status(500).send({
        message: 'An error occurred while getting property features',
        error: propTypeErr,
      });
      return;
    }

    if (!propWithType) {
      res.status(404).send({ message: 'Commercial property not found' });
      return;
    }

    res.status(200).send(propWithType);
    return;
  } else if (!ignoreType.includes(prop.purpose) && prop.type === 'plot') {
    const [propWithType, propTypeErr] = await common.p2r(
      PlotProperty.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (propTypeErr) {
      res.status(500).send({
        message: 'An error occurred while getting property features',
        error: propTypeErr,
      });
      return;
    }

    if (!propWithType) {
      res.status(404).send({ message: 'Plot property not found' });
      return;
    }

    res.status(200).send(propWithType);
    return;
  } else if (prop.purpose === 'coliving space') {
    const [propWithType, propTypeErr] = await common.p2r(
      ColivingSpace.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (propTypeErr) {
      res.status(500).send({
        message: 'An error occurred while getting property features',
        error: propTypeErr,
      });
      return;
    }

    if (!propWithType) {
      res.status(404).send({ message: 'Coliving space property not found' });
      return;
    }

    res.status(200).send(propWithType);
    return;
  } else if (prop.purpose === 'coworking space') {
    const [propWithType, propTypeErr] = await common.p2r(
      CoworkingSpace.findOne({
        property: prop._id,
      }).populate('property')
    );

    if (propTypeErr) {
      res.status(500).send({
        message: 'An error occurred while getting property features',
        error: propTypeErr,
      });
      return;
    }

    if (!propWithType) {
      res.status(404).send({ message: 'Coworking space property not found' });
      return;
    }

    res.status(200).send(propWithType);
    return;
  } else {
    res
      .status(200)
      .send({ message: 'Property type not specified', property: prop });
    return;
  }
};
