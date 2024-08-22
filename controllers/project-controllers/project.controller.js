const db = require('../../models');
const { Project, ProjectFeatures } = db;
const common = require('../../config/common.config');

/* ============================================================= COMMON PROJECT FILTERS ============================================================= */

function applyFilters(filterOptions, req) {
  if(req.query?.subtype) {
    const reqArray = req.query.subtype.split(',').map((item) => item.trim());
    filterOptions.subtype = { $in: reqArray }
  };
  if(req.query?.status && req.query?.status !== "all") {
    const reqArray = req.query.status.split(',').map((item) => item.trim());
    filterOptions.status = { $in: reqArray }
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
    const reqArray = req.query.ids.split(',').map((item) => db.mongoose.Types.ObjectId(item));
    filterOptions._id = { $in: reqArray }
  };
  if(req.query?.userId) {
    filterOptions.user = db.mongoose.Types.ObjectId(req.query?.userId)
  };
  if(req.query?.address) filterOptions.address = { $regex: req.query.address, $options: "i" };
  if(req.query?.name) filterOptions.name = { $regex: req.query.name, $options: "i" };
  if (req.query?.minPrice || req.query?.maxPrice) {
    filterOptions["units.price"] = {
      $gte: parseFloat(req.query.minPrice) || 0,
      $lte: parseFloat(req.query.maxPrice) || Infinity
    };
  }
  
  if(req.query?.purpose){
    const reqArray = req.query.purpose.split(',').map((item) => item.trim());
    filterOptions.purpose = { $in: reqArray };
  } 
    
  if (req.query?.type && req.query?.type !== "all") {
    const reqArray = req.query.type.split(',').map((item) => item.trim());
    filterOptions.units = {
      $elemMatch: {
        type: { $in: reqArray }
      }
    };
  }
  
  if(req.query?.city){
    const reqArray = req.query.city.split(',').map((item) => new RegExp(item.trim(), 'i'));
    filterOptions.city = { $in: reqArray }
  }
  if(req.query?.location) {
    const reqArray = req.query.location.split(',').map((item) => new RegExp(item.trim(), 'i'));
    filterOptions.location = { $in: reqArray };
  }
  if (req.query?.minAreaSize || req.query?.maxAreaSize) {
    filterOptions["units.area"] = {
      $gte: parseFloat(req.query.minAreaSize) || 0,
      $lte: parseFloat(req.query.maxAreaSize) || Infinity
    };
  }
  if (req.query?.lat && req.query?.lng) {
    const radius = req.query?.radius || 10; // Set your desired radius in kilometers
    filterOptions.geoLocation = {
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


/* ============================================================= ADD PROJECT ============================================================= */
exports.addProject = async (req, res) => {
  let proj = new Project({
    ...req.body,
  });

  // Features
  let projectFeatures = new ProjectFeatures({...req.body});
  if(!projectFeatures?._id){
    projectFeatures = new ProjectFeatures()
  }
  const [addedProjectFeatures, projectFeaturesErr] = await common.p2r(projectFeatures.save());
  if (addedProjectFeatures?._id) {
    proj.features = addedProjectFeatures._id
  }else {
    console.log("Project features", projectFeatures)
    console.log("Added Project features", addedProjectFeatures)
    console.log("Added Project features ERROR====", projectFeaturesErr)
  }


  const [addedProj, projErr] = await common.p2r(proj.save());

  if (projErr) {
    res.status(500).send({
      message: 'An error occurred while adding project',
      error: projErr,
    });
    return;
  }

  if (!addedProj) {
    res.status(500).send({ message: 'Project not added' });
    return;
  }

  res.status(200).send(addedProj);
  return;
};

/* ============================================================= UPDATE PROJECT ============================================================= */
exports.updateProject = async (req, res) => {
  // let imagesNew = [];
  // if (req.body.images) {
  //   for (let i = 0; i < req.body.images.length; i++) {
  //     let imageName = req.body.images[i];
  //     imageName = imageName.replace(/ /g, '-');
  //     imagesNew.push(
  //       'project/' +
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
  //       'project/' +
  //         req.params.id +
  //         '/videos/' +
  //         common.appendDateToImage(videoName)
  //     );
  //   }
  // }
  // if (videosNew.length) {
  //   req.body.videos = videosNew;
  // }

  // let documentsNew = [];
  // if (req.body.documents) {
  //   for (let i = 0; i < req.body.documents.length; i++) {
  //     let docName = req.body.documents[i];
  //     docName = docName.replace(/ /g, '-');
  //     documentsNew.push(
  //       'project/' +
  //         req.params.id +
  //         '/documents/' +
  //         common.appendDateToImage(docName)
  //     );
  //   }
  // }
  // if (documentsNew.length) {
  //   req.body.documents = documentsNew;
  // }

  // let floorPlansNew = [];
  // if (req.body.floorPlans) {
  //   for (let i = 0; i < req.body.floorPlans.length; i++) {
  //     let fPlanName = req.body.floorPlans[i];
  //     fPlanName = fPlanName.replace(/ /g, '-');
  //     floorPlansNew.push(
  //       'project/' +
  //         req.params.id +
  //         '/floorPlans/' +
  //         common.appendDateToImage(fPlanName)
  //     );
  //   }
  // }
  // if (floorPlansNew.length) {
  //   req.body.floorPlans = floorPlansNew;
  // }

  // let paymentPlanNew = [];
  // if (req.body.paymentPlans) {
  //   for (let i = 0; i < req.body.paymentPlans.length; i++) {
  //     let pPlanName = req.body.paymentPlans[i];
  //     pPlanName = pPlanName.replace(/ /g, '-');
  //     paymentPlanNew.push(
  //       'project/' +
  //         req.params.id +
  //         '/paymentPlans/' +
  //         common.appendDateToImage(pPlanName)
  //     );
  //   }
  // }
  // if (paymentPlanNew.length) {
  //   req.body.paymentPlans = paymentPlanNew;
  // }

  // let progressUpdateNew = [];
  // if (req.body.progressUpdate) {
  //   for (let i = 0; i < req.body.progressUpdate.length; i++) {
  //     let progUpdateName = req.body.progressUpdate[i];
  //     progUpdateName = progUpdateName.replace(/ /g, '-');
  //     progressUpdateNew.push(
  //       'project/' +
  //         req.params.id +
  //         '/progressUpdate/' +
  //         common.appendDateToImage(progUpdateName)
  //     );
  //   }
  // }
  // if (progressUpdateNew.length) {
  //   req.body.progressUpdate = progressUpdateNew;
  // }

  const [updatedProj, projErr] = await common.p2r(
    Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
  );

  if (projErr) {
    res.status(500).send({
      message: 'An error occurred while updating project',
      error: projErr,
    });
    return;
  }

  if (!updatedProj) {
    res.status(500).send({ message: 'Project not found' });
    return;
  }

  if (updatedProj?.features) {
    const [updatedFeatures, updateFeaturesErr] = await common.p2r(
      ProjectFeatures.findByIdAndUpdate(updatedProj.features, req.body, {
        new: true,
        runValidators: true,
      })
    );
    if (updateFeaturesErr) {
      res.status(500).send({
        message: 'An error occurred while updating project features',
        error: updateFeaturesErr,
      });
      return;
    }
  
    if (!updatedFeatures) {
      return res.status(404).send({ message: 'Features not found or updated' });
    }
  }

  res.status(200).send(updatedProj);
  return;
};

/* ============================================================= DELETE PROJECT ============================================================= */
exports.deleteProject = async (req, res) => {
  const [proj, projErr] = await common.p2r(
    Project.findByIdAndDelete(req.params.id)
  );

  if (projErr) {
    res.status(500).send({
      message: 'An error occurred while deleting project',
      error: projErr,
    });
    return;
  }

  if (!proj) {
    res.status(500).send({ message: 'Project not found' });
    return;
  }

  const [features, featuresErr] = await common.p2r(
    ProjectFeatures.findByIdAndDelete(proj.features)
  );

  if (featuresErr) {
    res.status(500).send({
      message: 'An error occurred while deleting project features',
      error: featuresErr,
    });
    return;
  }

  if (!features) {
    res.status(200).send({
      message: 'Project deleted successfully',
      project: proj,
    });
    return;
  } else {
    res.status(200).send({
      message: 'Project and its features deleted successfully',
      project: proj,
    });
    return;
  }
};

/* ============================================================= GET PROJECT ============================================================= */
exports.getProject = async (req, res) => {
  const [proj, projErr] = await common.p2r(Project.findById(req.params.id).populate({
      path: 'user',
      model: 'User',
      select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
  }).populate({
      path: 'features',
      model: 'ProjectFeatures',
  }));

  if (projErr) {
    res.status(500).send({
      message: 'An error occurred while finding project',
      error: projErr,
    });
    return;
  }

  if (!proj) {
    res.status(500).send({ message: 'Project not found' });
    return;
  }

  res.status(200).send(proj);
  return;
};

/* ============================================================= GET ALL POINTS ============================================================= */
exports.getAllPoints = async (req, res) => {

  let filterFields = '_id address bed bath subtype price name geoLocation images createdAt city location area'

  let filterOptions = {};
  let sortOptions = {};

  applyFilters(filterOptions, req);
  applySort(sortOptions, req);

  const [projs, projErr] = await common.p2r(
    Project.find(filterOptions).sort(sortOptions)
      .skip(
        parseInt(req.query.pageNumber) > 0
          ? (parseInt(req.query.pageNumber) - 1) * parseInt(req.query.nPerPage)
          : 0
      )
      .limit(parseInt(req.query.nPerPage)).populate({
          path: 'user',
          model: 'User',
          select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
      }).select(filterFields)
  );

  if (projErr) {
    res.status(500).send({
      message: 'An error occurred while getting projects',
      error: projErr,
    });
    return;
  }

  if (!projs) {
    res.status(500).send({ message: 'Projects not found' });
    return;
  }

  // if(req.query?.sort) applyAllPropertySort(allProp, req.query?.sort)

  // allProp = common.paginateArray(
  //   allProp,
  //   req.query.pageNumber,
  //   req.query.nPerPage
  // );

  res.status(200).send(projs);
  return;
};

/* ============================================================= GET ALL PROJECTS ============================================================= */
exports.getAllProjects = async (req, res) => {
  let filterOptions = {};
  let sortOptions = {};

  applyFilters(filterOptions, req);
  applySort(sortOptions, req);

  const [projs, projErr] = await common.p2r(
    Project.find(filterOptions).sort(sortOptions)
      .skip(
        parseInt(req.query.pageNumber) > 0
          ? (parseInt(req.query.pageNumber) - 1) * parseInt(req.query.nPerPage)
          : 0
      )
      .limit(parseInt(req.query.nPerPage)).populate({
          path: 'user',
          model: 'User',
          select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
      })
  );

  if (projErr) {
    res.status(500).send({
      message: 'An error occurred while getting projects',
      error: projErr,
    });
    return;
  }

  if (!projs) {
    res.status(500).send({ message: 'Projects not found' });
    return;
  }

  // Calculate metadata
  const totalItems = await Project.countDocuments(filterOptions);
  const totalPages = Math.ceil(totalItems / parseInt(req.query.nPerPage || "10"));
  const currentPage = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.nPerPage) || 10;

  // Create the response object with metadata
  const responseObject = {
    data: projs,
    meta: {
      totalItems,
      totalPages,
      currentPage,
      pageSize,
    },
  };

  res.status(200).send(responseObject);
  return;
};

/* ============================================================= GET ALL PROJECTS OF USER ============================================================= */
exports.getAllProjectsOfUser = async (req, res) => {
  let filterOptions = {};
  let sortOptions = {};

  applyFilters(filterOptions, req);
  applySort(sortOptions, req);

  const [projs, projErr] = await common.p2r(
    Project.find({ user: req.params.id, ...filterOptions }).sort(sortOptions)
      .skip(
        parseInt(req.query.pageNumber) > 0
          ? (parseInt(req.query.pageNumber) - 1) * parseInt(req.query.nPerPage)
          : 0
      )
      .limit(parseInt(req.query.nPerPage)).populate({
        path: 'user',
        model: 'User',
        select: {'_id': 1, 'email': 1, 'username': 1, 'type': 1, 'status': 1}
    })
  );

  if (projErr) {
    res.status(500).send({
      message: 'An error occurred while getting projects of user',
      error: projErr,
    });
    return;
  }

  if (!projs) {
    res.status(500).send({ message: 'Projects of user not found' });
    return;
  }

    // Calculate metadata
    const totalItems = await Project.countDocuments(filterOptions);
    const totalPages = Math.ceil(totalItems / parseInt(req.query.nPerPage || "1"));
    const currentPage = parseInt(req.query.pageNumber) || 1;
    const pageSize = parseInt(req.query.nPerPage) || 10;
  
    // Create the response object with metadata
    const responseObject = {
      data: projs,
      meta: {
        totalItems,
        totalPages,
        currentPage,
        pageSize,
      },
    };


  res.status(200).send(responseObject);
  return;
};

/* ============================================================= ADD FEATURES OF PROJECT ============================================================= */
exports.addFeaturesOfProject = async (req, res) => {
  const features = new ProjectFeatures({
    //main Features
    lobbyInBuilding: req.body.lobbyInBuilding,
    doubleGlazedWindows: req.body.doubleGlazedWindows,
    centralAirConditioning: req.body.centralAirConditioning,
    centralHeating: req.body.centralHeating,
    flooring: req.body.flooring,
    electricityBackup: req.body.electricityBackup,
    fireFightingSystem: req.body.fireFightingSystem,
    elevators: req.body.elevators,
    serviceElevatorsInBuilding: req.body.serviceElevatorsInBuilding,
    otherMainFeatures: req.body.otherMainFeatures,
    gatedCommunity: req.body.gatedCommunity,
    parkingSpaces: req.body.parkingSpaces,

    sewerage: req.body.sewerage,
    utilities: req.body.utilities,
    accessibleByRoad: req.body.accessibleByRoad,

    // business And Communication
    broadbandInternetAccess: req.body.broadbandInternetAccess,
    satelliteOrCable: req.body.satelliteOrCable,
    businessCenterOrMediaRoom: req.body.businessCenterOrMediaRoom,
    intercom: req.body.intercom,
    atmMachines: req.body.atmMachines,
    otherBusinessAndCommunicationFeatures:
      req.body.otherBusinessAndCommunicationFeatures,

    // community Features
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

    // nearby Locations
    nearbySchools: req.body.nearbySchools,
    nearbyHospitals: req.body.nearbyHospitals,
    nearbyShoppingMalls: req.body.nearbyShoppingMalls,
    nearbyRestaurants: req.body.nearbyRestaurants,
    distanceFromAirport: req.body.distanceFromAirport,
    nearbyPublicTransport: req.body.nearbyPublicTransport,
    otherNearbyPlaces: req.body.otherNearbyPlaces,

    // other Facilities
    maintenanceStaff: req.body.maintenanceStaff,
    securityStaff: req.body.securityStaff,
    facilitiesForDisabled: req.body.facilitiesForDisabled,
    otherFacilities: req.body.otherFacilities,
    cctvSecurity: req.body.cctvSecurity,

    // healthcare And Recreational
    lawnOrGarden: req.body.lawnOrGarden,
    swimmingPool: req.body.swimmingPool,
    otherHealthcareAndRecreationalFeatures:
      req.body.otherHealthcareAndRecreationalFeatures,
  });

  const [addedFeatures, featuresErr] = await common.p2r(features.save());

  if (featuresErr) {
    res.status(500).send({
      message: 'An error occurred while adding project features',
      error: featuresErr,
    });
    return;
  }

  if (!addedFeatures) {
    res.status(500).send({ message: 'Project features not added' });
    return;
  }

  const [proj, projErr] = await common.p2r(
    Project.findByIdAndUpdate(
      req.params.id,
      { features: addedFeatures._id },
      {
        new: true,
        runValidators: true,
      }
    ).populate('features')
  );

  if (projErr) {
    res.status(500).send({
      message: 'An error occurred while adding features to project',
      error: projErr,
    });
    return;
  }

  if (!proj) {
    res.status(404).send({ message: 'Project not found or updated' });
    return;
  }

  res.status(200).send(proj);
  return;
};

/* ============================================================= UPDATE FEATURES OF PROJECT ============================================================= */
exports.updateFeaturesOfProject = async (req, res) => {
  const [proj, projErr] = await common.p2r(Project.findById(req.params.id));

  if (projErr) {
    res.status(500).send({
      message: 'An error occurred while finding project',
      error: projErr,
    });
    return;
  }

  if (!proj) {
    res.status(404).send({ message: 'Project not found' });
    return;
  }

  const [addedFeatures, featuresErr] = await common.p2r(
    ProjectFeatures.findByIdAndUpdate(proj.features, req.body, {
      new: true,
      runValidators: true,
    })
  );

  if (featuresErr) {
    res.status(500).send({
      message: 'An error occurred while updating features of project',
      error: featuresErr,
    });
    return;
  }

  if (!addedFeatures) {
    res.status(500).send({
      message: 'Project features not found or updated',
    });
    return;
  }

  proj.features = addedFeatures;
  res.status(200).send(proj);
  return;
};

/* ============================================================= GET FEATURES OF PROJECT ============================================================= */
exports.getFeaturesOfProject = async (req, res) => {
  const [proj, projErr] = await common.p2r(Project.findById(req.params.id));

  if (projErr) {
    res.status(500).send({
      message: 'An error occurred while finding project',
      error: projErr,
    });
    return;
  }

  if (!proj) {
    res.status(404).send({ message: 'Project not found' });
    return;
  }

  const [features, featuresErr] = await common.p2r(
    ProjectFeatures.findById(proj.features)
  );

  if (featuresErr) {
    res.status(500).send({
      message: 'An error occurred while finding project',
      error: featuresErr,
    });
    return;
  }

  if (!features) {
    res.status(500).send({
      message: 'Project features not found',
    });
    return;
  }

  res.status(200).send(features);
  return;
};
