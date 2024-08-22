const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

const db = require("../../models");
const {
  User,
  Agency,
  Staff,
  Builder,
  Property,
  ResProperty,
  CommProperty,
  PlotProperty,
  ColivingSpace,
  CoworkingSpace,
  Project,
} = db;

const common = require("../../config/common.config");
const authConfig = require("../../config/auth.config");
const sendEmail = require("../../config/sendEmail.config");

/* */
// Function to check if all required fields are filled for agency or builder
function checkAllFieldsFilled(profile, user) {
  let requiredFields = [];
  let requiredUserFields = [];

  if (user) {
    requiredUserFields = [
      "type",
      "status",
      "username",
      "registration_type",
      "city",
      "country",
      "address",
      "picture",
      "landlineNumber",
      "mobileNumbers",
      "whatsapp",
    ];
    if (user?.type === "builder") {
      const updatedRequiredUserFields = requiredUserFields.filter(
        (field) => field !== "picture"
      );
      requiredUserFields = updatedRequiredUserFields;
    }
    const isFieldsFilled = requiredUserFields.every(
      (field) =>
        user[field] !== undefined && user[field] !== null && user[field] !== ""
    );
    if (!isFieldsFilled) return false;
  }

  if (profile?.user?.type === "builder") {
    requiredFields = [
      "builderName",
      "builderLogo",
      "builderCoverPicture",
      "aboutUs",
      // 'ntn',
      // 'experienceYears',
      // 'onGoingProjects',
      // 'pastProjects',
      "experienceYears",
      "operatingCities",
      "verificationType",
      // 'landline',
      // 'name',
      "owners",
      "cnic",
      "partners",
    ];
    return requiredFields.every(
      (field) =>
        profile[field] !== undefined &&
        profile[field] !== null &&
        profile[field] !== ""
    );
  } else if (profile?.user?.type === "agency") {
    requiredFields = [
      "agencyName",
      "verificationType",
      "description",
      "serviceAreas",
      "propertyType",
      "propertyFor",
      "experienceYears",
      "agencyLogo",
      "agencyCoverPicture",
      "primaryPicture",
      "physicalAddress",
      "ceoName",
      "ceoDesignation",
      "ceoMessage",
      "ceoPicture",
    ];
    return requiredFields.every(
      (field) =>
        profile[field] !== undefined &&
        profile[field] !== null &&
        profile[field] !== ""
    );
  } else if (profile?.user?.type === "staff" && profile?.agency?._id) {
    requiredFields = [
      "agencyName",
      "verificationType",
      "description",
      "serviceAreas",
      "propertyType",
      "propertyFor",
      "experienceYears",
      "agencyLogo",
      "agencyCoverPicture",
      "primaryPicture",
      "physicalAddress",
      "ceoName",
      "ceoDesignation",
      "ceoMessage",
      "ceoPicture",
    ];
    return requiredFields.every(
      (field) =>
        profile.agency[field] !== undefined &&
        profile.agency[field] !== null &&
        profile.agency[field] !== ""
    );
  }

  return true;
}

exports.getAllUser = async (req, res) => {
  let [user, userErr] = await common.p2r(User.find({}).select("-password"));

  if (userErr) {
    res.status(500).send({
      message: "An error occurred while getting user profile",
      error: userErr,
    });
    return;
  }

  if (!user) {
    return res.status(404).send({ message: "User account not found" });
  }
  user = user.filter((data) => data.type == "enduser");

  res.status(200).send(user);
  return;
};
exports.getAllAgent = async (req, res) => {
  let [agent, userErr] = await common.p2r(User.find({}).select("-password"));

  if (userErr) {
    res.status(500).send({
      message: "An error occurred while getting user profile",
      error: userErr,
    });
    return;
  }

  if (!agent) {
    return res.status(404).send({ message: "User account not found" });
  }
  agent = agent.filter((data) => data.type == "agency");

  res.status(200).send(agent);
  return;
};
/* ==================================================== GET USER PROFILE ==================================================== */
exports.userProfile = async (req, res) => {
  const [user, userErr] = await common.p2r(
    User.findById(req.params.userId).select("-password")
  );

  if (userErr) {
    res.status(500).send({
      message: "An error occurred while getting user profile",
      error: userErr,
    });
    return;
  }

  if (!user) {
    return res.status(404).send({ message: "User account not found" });
  }

  if (user.type === "agency") {
    const [agency, agencyErr] = await common.p2r(
      Agency.findOne({
        user: user._id,
      }).populate("user", "-password")
    );

    if (agencyErr) {
      res.status(500).send({
        message: "An error occurred while getting agency profile",
        error: agencyErr,
      });
      return;
    }

    if (!agency) {
      return res.status(404).send({ message: "Agency account not found" });
    }

    res.status(200).send(agency);
    return;
  } else if (user.type === "staff") {
    const [staff, staffErr] = await common.p2r(
      Staff.findOne({
        user: user._id,
      })
        .populate("user", "-password")
        .populate("agency")
    );

    if (staffErr) {
      res.status(500).send({
        message: "An error occurred while getting staff profile",
        error: staffErr,
      });
      return;
    }

    if (!staff) {
      return res.status(404).send({ message: "Staff account not found", user });
    }

    res.status(200).send(staff);
    return;
  } else if (user.type === "builder") {
    const [builder, builderErr] = await common.p2r(
      Builder.findOne({
        user: user._id,
      }).populate("user", "-password")
    );

    if (builderErr) {
      res.status(500).send({
        message: "An error occurred while getting builder profile",
        error: builderErr,
      });
      return;
    }

    if (!builder) {
      return res.status(404).send({ message: "Builder account not found" });
    }

    const totalProjects = await Project.countDocuments({
      user: builder.user._id,
    });
    builder.totalProjects = totalProjects;

    res.status(200).send(builder);
    return;
  } else {
    res.status(200).send(user);
    return;
  }
};

/* ==================================================== UPDATE USER PROFILE ==================================================== */
exports.updateUserData = async (req, res) => {
  const [user, userErr] = await common.p2r(
    User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
      runValidators: true,
    }).select("-password")
  );

  if (userErr) {
    res.status(500).send({
      message: "An error occurred while updating user profile",
      error: userErr,
    });
    return;
  }

  if (!user) {
    return res
      .status(404)
      .send({ message: "User account not found or updated" });
  }

  let updatedProfile;

  if (user.type === "agency") {
    const [agency, agencyErr] = await common.p2r(
      Agency.findOneAndUpdate({ user: user._id }, req.body, {
        new: true,
        runValidators: true,
      }).populate("user", "-password")
    );

    if (agencyErr) {
      res.status(500).send({
        message: "An error occurred while updating agency profile",
        error: agencyErr,
      });
      return;
    }

    if (!agency) {
      return res
        .status(404)
        .send({ message: "Agency account not found or updated" });
    }

    updatedProfile = agency;
    // res.status(200).send(agency);
    // return;
  } else if (user.type === "staff") {
    const [staff, staffErr] = await common.p2r(
      Staff.findOneAndUpdate({ user: user._id }, req.body, {
        new: true,
        runValidators: true,
      })
        .populate("user", "-password")
        .populate("agency")
    );

    if (staffErr) {
      res.status(500).send({
        message: "An error occurred while updating staff profile",
        error: staffErr,
      });
      return;
    }

    if (!staff) {
      return res
        .status(404)
        .send({ message: "Staff account not found or updated" });
    }

    updatedProfile = staff;
    // res.status(200).send(staff);
    // return;
  } else if (user.type === "builder") {
    const [builder, builderErr] = await common.p2r(
      Builder.findOneAndUpdate({ user: user._id }, req.body, {
        new: true,
        runValidators: true,
      }).populate("user", "-password")
    );

    if (builderErr) {
      res.status(500).send({
        message: "An error occurred while updating builder profile",
        error: builderErr,
      });
      return;
    }

    if (!builder) {
      return res
        .status(404)
        .send({ message: "Builder account not found or updated" });
    }

    updatedProfile = builder;
    // res.status(200).send(builder);
    // return;
  } else {
    updatedProfile = user;
    // res.status(200).send(user);
    // return;
  }

  const allFieldsFilled = checkAllFieldsFilled(updatedProfile, user);

  if (allFieldsFilled) {
    user.profileStatus = "Completed";
    await user.save();
  }

  res.status(200).send(updatedProfile);
};

/* ==================================================== UPDATE USER  SEARCH ==================================================== */
exports.updateUserSearch = async (req, res) => {
  const [user, userErr] = await common.p2r(
    User.findById(req.params.userId).select("-password")
  );

  if (userErr) {
    res.status(500).send({
      message: "An error occurred while updating user profile",
      error: userErr,
    });
    return;
  }

  if (!user) {
    return res
      .status(404)
      .send({ message: "User account not found or updated" });
  }

  if (req?.body?.recentSearches) {
    user.recentSearches.push(req.body.recentSearches);
    if (user.recentSearches?.length > 10) {
      user.recentSearches.shift();
    }
  }

  if (req?.body?.likedProperties) {
    const isExistingProperty = user.likedProperties.find((id) =>
      id.equals(req.body.likedProperties)
    );
    if (isExistingProperty) {
      const newArray = user.likedProperties.filter(
        (id) => !id.equals(req.body.likedProperties)
      );
      user.likedProperties = newArray;
    } else {
      const [prop, propErr] = await common.p2r(
        Property.findById(req?.body?.likedProperties)
      );
      if (propErr) {
        res.status(500).send({
          message: "An error occurred while updating user liked properties",
          error: propErr,
        });
        return;
      }

      if (!prop) {
        return res.status(404).send({ message: "Given property not found" });
      }

      user.likedProperties.push(req.body.likedProperties);
    }
  }

  if (req?.body?.likedProjects) {
    const isExistingProject = user.likedProjects.find((id) =>
      id.equals(req.body.likedProjects)
    );
    if (isExistingProject) {
      const newArray = user.likedProjects.filter(
        (id) => !id.equals(req.body.likedProjects)
      );
      user.likedProjects = newArray;
    } else {
      const [proj, projErr] = await common.p2r(
        Project.findById(req?.body?.likedProjects)
      );
      if (projErr) {
        res.status(500).send({
          message: "An error occurred while updating user liked projects",
          error: projErr,
        });
        return;
      }

      if (!proj) {
        return res.status(404).send({ message: "Given project not found" });
      }

      user.likedProjects.push(req.body.likedProjects);
    }
  }

  await user.save();

  res.status(200).send(user);
};

/* ==================================================== CHANGE PASSWORD ==================================================== */
exports.changePassword = async (req, res) => {
  if (req.body.oldPassword && req.body.newPassword) {
    const [user, userErr] = await common.p2r(User.findById(req.params.userId));

    if (userErr) {
      res.status(500).send({
        message: "An error occurred while getting user",
        error: userErr,
      });
      return;
    }

    if (!user) {
      return res.status(404).send({ message: "User account not found" });
    }

    var passwordIsValid = bcrypt.compareSync(
      req.body.oldPassword,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Old password is incorrect",
      });
    }
    console.log(req.body.oldPassword, req.body.newPassword);

    const newPassword = bcrypt.hashSync(req.body.newPassword, 8);

    user.password = newPassword;

    const [savedUser, savedUserErr] = await common.p2r(user.save());

    if (savedUserErr) {
      res.status(500).send({
        message: "An error occurred while updating password of user",
        error: savedUserErr,
      });
      return;
    }

    res.status(200).send({
      message: "Password updated successfully",
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      userType: savedUser.userType,
    });
    return;
  } else {
    res
      .status(500)
      .send({ message: "Please provide old password and new password" });
    return;
  }
};

/* ==================================================== VERIFY USER ==================================================== */
exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { confirmationCode: req.query.confirmationCode },
      { status: "Active", confirmationCode: "" },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      // return res.status(404).redirect(`${authConfig.FRONT_BASE_URL}`);
      return res.status(404).send({ message: "Invalid confirmation code" });
    }

    // return res.send({ message: `User account activated successfully` }).redirect(`${authConfig.FRONT_BASE_URL}/login`);

    res.send({ message: `User account activated successfully` });
    return;
  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
};

/* ============================================================= GET ALL LIKED PROPERTIES OF USER ============================================================= */
exports.getAllLikedPropertiesOfUser = async (req, res) => {
  var allProp = [];
  let filterOptions = {};
  let propertyFilterOptions = {};
  let sortOptions = {};

  // Find User
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).send({ message: "User not found!" });
  }

  if (!user?.likedProperties?.length > 0) {
    return res.status(404).send({ message: "Liked Properties not found!" });
  }

  // Getting ids all all user properties
  const pQuery = {
    _id: { $in: user.likedProperties },
  };
  const [props, propsErr] = await common.p2r(Property.find(pQuery));

  if (propsErr) {
    res.status(500).send({
      message: "An error occurred while getting properties of user",
      error: propsErr,
    });
    return;
  }

  let ids = props.map((proplisting) => proplisting.id);
  // =============================

  const [resProps, resErr] = await common.p2r(
    ResProperty.find({
      property: { $in: ids },
      ...filterOptions,
    })
      .sort(sortOptions)
      .populate({
        path: "property",
        match: propertyFilterOptions,
      })
  );

  if (resErr) {
    res.status(500).send({
      message: "An error occurred while getting residential properties",
      error: resErr,
    });
    return;
  }

  allProp = allProp.concat(resProps);

  const [commProps, commErr] = await common.p2r(
    CommProperty.find({
      property: { $in: ids },
      ...filterOptions,
    })
      .sort(sortOptions)
      .populate({
        path: "property",
        match: propertyFilterOptions,
      })
  );

  if (commErr) {
    res.status(500).send({
      message: "An error occurred while getting commercial properties",
      error: commErr,
    });
    return;
  }

  allProp = allProp.concat(commProps);

  const [plotProps, plotErr] = await common.p2r(
    PlotProperty.find({
      property: { $in: ids },
      ...filterOptions,
    })
      .sort(sortOptions)
      .populate({
        path: "property",
        match: propertyFilterOptions,
      })
  );

  if (plotErr) {
    res.status(500).send({
      message: "An error occurred while getting plot properties",
      error: plotErr,
    });
    return;
  }

  allProp = allProp.concat(plotProps);

  const [colivSpaces, colivErr] = await common.p2r(
    ColivingSpace.find({
      property: { $in: ids },
      ...filterOptions,
    })
      .sort(sortOptions)
      .populate({
        path: "property",
        match: propertyFilterOptions,
      })
  );

  if (colivErr) {
    res.status(500).send({
      message: "An error occurred while getting coliving space properties",
      error: colivErr,
    });
    return;
  }

  allProp = allProp.concat(colivSpaces);

  const [coworkSpaces, coworkErr] = await common.p2r(
    CoworkingSpace.find({
      property: { $in: ids },
      ...filterOptions,
    })
      .sort(sortOptions)
      .populate({
        path: "property",
        match: propertyFilterOptions,
      })
  );

  if (coworkErr) {
    res.status(500).send({
      message: "An error occurred while getting coworking space properties",
      error: coworkErr,
    });
    return;
  }

  allProp = allProp.concat(coworkSpaces);

  allProp = allProp.filter((p) => p.property !== null);

  allProp = common.paginateArray(
    allProp,
    req.query.pageNumber,
    req.query.nPerPage
  );

  res.status(200).send(allProp);
  return;
};

/* ============================================================= GET ALL Liked PROJECTS OF USER ============================================================= */
exports.getAllLikedProjectsOfUser = async (req, res) => {
  let filterOptions = {};
  let sortOptions = {};

  // Find User
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).send({ message: "User not found!" });
  }

  if (!user?.likedProjects?.length > 0) {
    return res.status(404).send({ message: "Liked Projects not found!" });
  }

  const pQuery = {
    _id: { $in: user.likedProjects },
    ...filterOptions,
  };

  const [projs, projErr] = await common.p2r(
    Project.find(pQuery)
      .sort(sortOptions)
      .skip(
        parseInt(req.query.pageNumber) > 0
          ? (parseInt(req.query.pageNumber) - 1) * parseInt(req.query.nPerPage)
          : 0
      )
      .limit(parseInt(req.query.nPerPage))
      .populate({
        path: "user",
        model: "User",
        select: { _id: 1, email: 1, username: 1, type: 1, status: 1 },
      })
  );

  if (projErr) {
    res.status(500).send({
      message: "An error occurred while getting projects of user",
      error: projErr,
    });
    return;
  }

  if (!projs) {
    res.status(500).send({ message: "Projects of user not found" });
    return;
  }

  // Calculate metadata
  const totalItems = await Project.countDocuments(filterOptions);
  const totalPages = Math.ceil(
    totalItems / parseInt(req.query.nPerPage || "1")
  );
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

/* ==================================================== GET ALL AGENCIES ==================================================== */
exports.getAllAgencies = async (req, res) => {
  let filterOptions = {};
  let userFilterOptions = {};
  if (req?.query?.verificationType && req.query?.verificationType !== "all") {
    filterOptions.verificationType = req.query.verificationType;
  }
  if (req?.query?.physicalAddress) {
    filterOptions.physicalAddress = {
      $regex: req.query.physicalAddress,
      $options: "i",
    };
  }
  if (req?.query?.agencyName) {
    filterOptions.agencyName = { $regex: req.query.agencyName, $options: "i" };
  }
  if (req?.query?.city) {
    const reqArray = req.query.city
      .split(",")
      .map((item) => new RegExp(item.trim(), "i"));
    userFilterOptions.city = { $in: reqArray };
  }
  try {
    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const nPerPage = parseInt(req.query.nPerPage) || 10;

    const totalAgencies = await Agency.countDocuments();
    const totalPages = Math.ceil(totalAgencies / nPerPage);

    const agencies = await Agency.find(filterOptions)
      .populate({
        path: "user",
        match: userFilterOptions,
        select: { password: 0 },
      })
      .skip((pageNumber - 1) * nPerPage)
      .limit(nPerPage);

    let allAgencies = agencies.filter((a) => a.user !== null && a?.user);

    if (allAgencies.length === 0) {
      return res.status(404).send({ message: "No agencies found" });
    }

    // Get total count of properties for each agency
    for (let agency of allAgencies) {
      const totalProperties = await Property.countDocuments({
        user: agency.user._id,
      });
      agency.totalProperties = totalProperties;
    }

    const response = {
      data: allAgencies,
      meta: {
        totalItems: totalAgencies,
        totalPages,
        currentPage: pageNumber,
        perPage: nPerPage,
      },
    };

    res.status(200).send(response);
    return;
  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
};

/* ==================================================== GET ALL STAFF ==================================================== */

exports.getAllStaff = async (req, res) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const nPerPage = parseInt(req.query.nPerPage) || 10;

    const totalStaff = await Staff.countDocuments();
    const totalPages = Math.ceil(totalStaff / nPerPage);

    const staff = await Staff.find()
      .populate("user", "-password")
      .skip((pageNumber - 1) * nPerPage)
      .limit(nPerPage);

    if (staff.length === 0) {
      return res.status(404).send({ message: "No staff found" });
    }

    const response = {
      data: staff,
      meta: {
        totalItems: totalStaff,
        totalPages,
        currentPage: pageNumber,
        perPage: nPerPage,
      },
    };

    res.status(200).send(response);
    return;
  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
};

/* ==================================================== GET ALL STAFF OF AGENCY ==================================================== */
exports.getAllStaffOfAgency = async (req, res) => {
  const [agency, agencyErr] = await common.p2r(
    Agency.findOne({ _id: req.params.agencyId })
  );

  if (agencyErr) {
    res.status(500).send({
      message: "An error occurred while getting agency",
      error: agencyErr,
    });
    return;
  }

  const [staff, staffErr] = await common.p2r(
    Staff.find({ agency: req.params.agencyId })
      .populate("user", "-password")
      .skip(
        parseInt(req.query.pageNumber) > 0
          ? (parseInt(req.query.pageNumber) - 1) * parseInt(req.query.nPerPage)
          : 0
      )
      .limit(parseInt(req.query.nPerPage))
  );

  if (staffErr) {
    res.status(500).send({
      message: "An error occurred while getting staff",
      error: staffErr,
    });
    return;
  }

  if (!staff) {
    return res.status(404).send({ message: "No staff found" });
  }

  if (!agency) {
    res.status(404).send({
      message: "Agency not found",
    });
    return;
  }

  staff.forEach((s) => (s.agency = agency));

  res.status(200).send(staff);
  return;
};

/* ==================================================== GET ALL BUILDERS ==================================================== */
exports.getAllBuilders = async (req, res) => {
  let filterOptions = {};
  let userFilterOptions = {};
  if (req?.query?.verificationType && req.query?.verificationType !== "all") {
    filterOptions.verificationType = req.query.verificationType;
  }
  if (req?.query?.builderName) {
    filterOptions.builderName = {
      $regex: req.query.builderName,
      $options: "i",
    };
  }
  if (req?.query?.city) {
    const reqArray = req.query.city
      .split(",")
      .map((item) => new RegExp(item.trim(), "i"));
    userFilterOptions.city = { $in: reqArray };
  }
  try {
    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const nPerPage = parseInt(req.query.nPerPage) || 10;

    const totalBuilders = await Builder.countDocuments();
    const totalPages = Math.ceil(totalBuilders / nPerPage);

    const builders = await Builder.find(filterOptions)
      .populate({
        path: "user",
        match: userFilterOptions,
        select: { password: 0 },
      })
      .skip((pageNumber - 1) * nPerPage)
      .limit(nPerPage);

    let allBuilders = builders.filter((a) => a.user !== null && a?.user);

    if (allBuilders.length === 0) {
      return res.status(404).send({ message: "No builders found" });
    }

    // Get total count of projects for each builder
    for (let builder of allBuilders) {
      const totalProjects = await Project.countDocuments({
        user: builder.user._id,
      });
      builder.totalProjects = totalProjects;
    }

    const response = {
      data: allBuilders,
      meta: {
        totalItems: totalBuilders,
        totalPages,
        currentPage: pageNumber,
        perPage: nPerPage,
      },
    };

    res.status(200).send(response);
    return;
  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
};

/* ==================================================== CHANGE USER TYPE ==================================================== */
exports.changeUserType = async (req, res) => {
  const [user, userErr] = await common.p2r(User.findById(req.query.userId));

  if (userErr) {
    res.status(500).send({
      message: "An error occurred while getting user",
      error: userErr,
    });
    return;
  }

  if (!user) {
    return res.status(404).send({ message: "No user found" });
  }

  if (user.type.toLowerCase() === req.query.newType.toLowerCase()) {
    return res
      .status(200)
      .send({ message: "Current user type is the same as new type specified" });
  }

  let oldUserType = user.type;

  if (req.query.newType === "agency") {
    const agency = new Agency({
      user: user._id,
    });

    const [savedAgency, agencyErr] = await common.p2r(agency.save());

    if (agencyErr) {
      res.status(500).send({
        message: "An error occurred while signing up agency",
        error: agencyErr,
      });
      return;
    }

    if (!savedAgency) {
      res.status(500).send({
        message: "Agency not signed up",
      });
      return;
    }
  } else if (req.query.newType === "staff") {
    const staff = new Staff({
      user: user._id,
    });

    const [savedStaff, staffErr] = await common.p2r(staff.save());

    if (staffErr) {
      res.status(500).send({
        message: "An error occurred while signing up staff",
        error: staffErr,
      });
      return;
    }

    if (!savedStaff) {
      res.status(500).send({
        message: "Staff not signed up",
      });
      return;
    }
  } else if (req.query.newType === "builder") {
    const builder = new Builder({
      user: user._id,
    });

    const [savedBuilder, builderErr] = await common.p2r(builder.save());

    if (builderErr) {
      res.status(500).send({
        message: "An error occurred while signing up builder",
        error: builderErr,
      });
      return;
    }

    if (!savedBuilder) {
      res.status(500).send({
        message: "Builder not signed up",
      });
      return;
    }
  }

  if (user.type === "agency") {
    const [delAgency, agencyErr] = await common.p2r(
      Agency.findOneAndDelete({ user: req.query.userId })
    );

    if (agencyErr) {
      res.status(500).send({
        message: "An error occurred while deleting agency (old user type)",
        error: agencyErr,
      });
      return;
    }

    if (!delAgency) {
      res.status(404).send({
        message: "Agency (old user type) to delete not found",
      });
      return;
    }
  } else if (user.type === "staff") {
    const [delStaff, staffErr] = await common.p2r(
      Staff.findOneAndDelete({ user: req.query.userId })
    );

    if (staffErr) {
      res.status(500).send({
        message: "An error occurred while deleting staff (old user type)",
        error: staffErr,
      });
      return;
    }

    if (!delStaff) {
      res.status(404).send({
        message: "Staff (old user type) to delete not found",
      });
      return;
    }
  } else if (user.type === "builder") {
    const [delBuilder, builderErr] = await common.p2r(
      Builder.findOneAndDelete({ user: req.query.userId })
    );

    if (builderErr) {
      res.status(500).send({
        message: "An error occurred while deleting builder (old user type)",
        error: builderErr,
      });
      return;
    }

    if (!delBuilder) {
      res.status(404).send({
        message: "Builder (old user type) to delete not found",
      });
      return;
    }
  }

  user.type = req.query.newType;

  const [updatedUser, updateErr] = await common.p2r(user.save());

  if (updateErr) {
    res.status(500).send({
      message: "An error occurred while updating user type",
      error: updateErr,
    });
    return;
  }

  if (!updatedUser) {
    res.status(500).send({
      message: "User type not updated",
    });
    return;
  }

  res.status(200).send({
    message: `User type changed from ${oldUserType} to ${req.query.newType}`,
  });
  return;
};

/* ==================================================== USER SEND FORGOT PASSWORD EMAIL ==================================================== */
exports.sendForgotPasswordEmail = async (req, res) => {
  const [user, userErr] = await common.p2r(
    User.findOne({ email: req.params.email })
  );

  if (userErr) {
    res.status(500).send({
      message: "An error occurred while finding user",
      error: userErr,
    });
    return;
  }

  if (!user) {
    return res.status(404).send({ message: "User account not found" });
  }

  const token = jwt.sign({ email: req.params.email }, authConfig.secret, {
    expiresIn: 86400, // 24 hours
  });

  user.resetPasswordCode = token;

  const [updatedUser, updatedUserErr] = await common.p2r(user.save());

  if (updatedUserErr) {
    res.status(500).send({
      message: "An error occurred while updating user",
      error: updatedUserErr,
    });
    return;
  }

  if (!updatedUser) {
    return res.status(404).send({ message: "User not updated" });
  }

  const [sentEmail, sendEmailErr] = await common.p2r(
    // sendEmail.sendConfirmationEmail(req.body.name, email, '', 123);
    sendEmail.sendForgotPasswordEmail({
      name: user.username,
      email: user.email,
      link: `${authConfig.FRONT_BASE_URL}/reset?code=${token}`,
    })
  );

  if (sendEmailErr) {
    res.status(500).send({
      message: "Error occurred while sending email",
      error: sendEmailErr,
    });
    return;
  }

  res.status(200).send({ message: "Reset Password email has been sent" });
  return;
};

/* ==================================================== USER CHANGE PASSWORD VIA FORGOT PASSWORD EMAIL ==================================================== */
exports.changePasswordByForgotEmail = async (req, res) => {
  const [user, userErr] = await common.p2r(
    User.findOne({ resetPasswordCode: req.params.resetPasswordCode })
  );

  if (userErr) {
    res.status(500).send({
      message: "An error occurred while finding user",
      error: userErr,
    });
    return;
  }

  if (!user) {
    return res
      .status(404)
      .send({ message: "No user found with given reset password code" });
  }

  if (!req.body.newPassword) {
    res.status(500).send({
      message: "Please provide new password",
    });
    return;
  }

  let err = "";
  jwt.verify(
    user.resetPasswordCode,
    authConfig.secret,
    (verifyErr, decoded) => {
      if (err) {
        err = verifyErr;
        return;
      }
    }
  );

  if (err.length) {
    return res.status(401).send({
      message:
        "Link expired. Please select the Reset Password option again to get a new link.",
    });
  }

  const newPassword = bcrypt.hashSync(req.body.newPassword, 8);
  user.password = newPassword;
  user.resetPasswordCode = "";

  const [updatedUser, updatedUserErr] = await common.p2r(user.save());

  if (updatedUserErr) {
    res.status(500).send({
      message: "An error occurred while updating user",
      error: updatedUserErr,
    });
    return;
  }

  if (!updatedUser) {
    return res.status(404).send({ message: "User not updated" });
  }

  res.status(200).send({
    message: "Password updated successfully",
    id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    userType: updatedUser.userType,
  });
  return;
};

/* ==================================================== DELETE USER ==================================================== */
exports.deleteUser = async (req, res) => {
  const [user, userErr] = await common.p2r(
    User.findOne({ _id: req.params.userId })
  );

  if (userErr) {
    res.status(500).send({
      message: "An error occurred while finding user",
      error: userErr,
    });
    return;
  }

  if (!user) {
    return res.status(404).send({ message: "No user found" });
  }

  if (user.type === "agency") {
    const [agency, agencyErr] = await common.p2r(
      Agency.findByIdAndDelete({ user: user._id })
    );

    if (agencyErr) {
      res.status(500).send({
        message: "An error occurred while deleting agency",
        error: agencyErr,
      });
      return;
    }

    if (!agency) {
      return res.status(404).send({ message: "Agency account not found " });
    }
  } else if (user.type === "staff") {
    const [staff, staffErr] = await common.p2r(
      Staff.findByIdAndDelete({ user: user._id })
    );

    if (staffErr) {
      res.status(500).send({
        message: "An error occurred while deleting staff profile",
        error: staffErr,
      });
      return;
    }

    if (!staff) {
      return res.status(404).send({ message: "Staff account not found" });
    }
  } else if (user.type === "builder") {
    const [builder, builderErr] = await common.p2r(
      Builder.findByIdAndDelete({ user: user._id })
    );

    if (builderErr) {
      res.status(500).send({
        message: "An error occurred while deleting builder profile",
        error: builderErr,
      });
      return;
    }

    if (!builder) {
      return res.status(404).send({ message: "Builder account not found" });
    }
  }

  const [userDel, userDelErr] = await common.p2r(
    User.findByIdAndDelete({ _id: user._id })
  );

  if (userDelErr) {
    res.status(500).send({
      message: "An error occurred while deleting user",
      error: userDelErr,
    });
    return;
  }

  res.status(200).send({
    message: "User Deleted successfully",
  });
  return;
};

/* ==================================================== DELETE AGENCY STAFF ==================================================== */
exports.deleteAgencyStaff = async (req, res) => {
  const [staff, staffErr] = await common.p2r(
    Staff.findOne({
      agency: req.params.agencyId,
      _id: req.params.staffId,
    }).populate("user", "-password")
  );

  if (staffErr) {
    res.status(500).send({
      message: "An error occurred while finding agent",
      error: staffErr,
    });
    return;
  }

  if (!staff) {
    return res.status(404).send({ message: "No agent found" });
  }

  if (staff?.user?.type === "staff") {
    const [staffDel, staffDelErr] = await common.p2r(
      Staff.findByIdAndDelete({ _id: staff._id })
    );

    if (staffDelErr) {
      res.status(500).send({
        message: "An error occurred while deleting staff profile",
        error: staffDelErr,
      });
      return;
    }

    if (!staffDel) {
      return res.status(404).send({ message: "Staff account not found" });
    }
  }

  const [userDel, userDelErr] = await common.p2r(
    User.findByIdAndDelete({ _id: staff.user._id })
  );

  if (userDelErr) {
    res.status(500).send({
      message: "An error occurred while deleting user",
      error: userDelErr,
    });
    return;
  }

  res.status(200).send({
    message: "Staff Deleted successfully",
  });
  return;
};

/* ==================================================== SEND CONTACT EMAIL ==================================================== */
exports.sendContactEmail = async (req, res) => {
  const [sentEmail, sendEmailErr] = await common.p2r(
    // sendEmail.sendConfirmationEmail(req.body.name, email, '', 123);
    sendEmail.sendContactEmail({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      city: req.body?.city || "N/A",
      subject: req.body?.subject || "N/A",
      message: req.body?.message || "N/A",
    })
  );

  if (sendEmailErr) {
    res.status(500).send({
      message: "Error occurred while sending email",
      error: sendEmailErr,
    });
    return;
  }

  res.status(200).send({ message: "Contact details sent successfully" });
  return;
};
