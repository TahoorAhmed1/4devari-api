const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const config = require('../../config/auth.config');
const db = require('../../models');
const { User, Agency, Staff, Builder, Inbox } = db;

const common = require('../../config/common.config');
const sendEmail = require('../../config/sendEmail.config');

/* ==================================================== SIGN UP ==================================================== */
exports.signUp = async (req, res) => {
  const { email, username, password, type } = req.body;

  const confirmationCode = jwt.sign({ email: req.body.email }, config.secret);

  const user = new User({
    ...req.body,
    email: email,
    username: username,
    password: bcrypt.hashSync(password, 8),
    type: type,
    confirmationCode: confirmationCode,
    profileStatus: 'Pending',
  });

  const [savedUser, userErr] = await common.p2r(user.save());

  if (userErr) {
    res.status(500).send({
      message: 'An error occurred while signing up user',
      error: userErr,
    });
    return;
  }

  if (!savedUser) {
    res.status(500).send({
      message: 'User not signed up',
    });
    return;
  }

  const newInbox = new Inbox({
    user: savedUser._id,
  });

  const [saveInbox, saveInboxErr] = await common.p2r(newInbox.save());

  if (saveInboxErr) {
    res.status(500).send({
      message: 'An error occurred while creating user inbox',
      error: saveInboxErr,
    });
    return;
  }

  if (!saveInbox) {
    res.status(500).send({
      message: 'User inbox not created',
    });
    return;
  }

  let userType = 'User';

  if (type.toLowerCase() === 'agency') {
    const agency = new Agency({
      city: req.body.city,
      location: req.body.location,
      agencyName: req.body.agencyName,
      description: req.body.description,
      serviceAreas: req.body.serviceAreas,
      propertyType: req.body.propertyType,
      propertyFor: req.body.propertyFor,
      experienceYears: req.body.experienceYears,
      agencyLogo: req.body.agencyLogo,
      agencyCoverPicture: req.body.agencyCoverPicture,
      primaryPicture: req.body.primaryPicture,
      physicalAddress: req.body.physicalAddress,

      additionalEmail: req.body.additionalEmail,
      additionalMobileNumber: req.body.additionalMobileNumber,
      whatsappNumber: req.body.whatsappNumber,

      user: savedUser._id,
    });

    const [savedAgency, agencyErr] = await common.p2r(agency.save());

    if (agencyErr) {
      res.status(500).send({
        message: 'An error occurred while signing up agency',
        error: agencyErr,
      });
      return;
    }

    if (!savedAgency) {
      res.status(500).send({
        message: 'Agency not signed up',
      });
      return;
    }

    userType = 'Agency';
  } else if (type.toLowerCase() === 'staff') {
    const staff = new Staff({
      staffPicture: req.body.staffPicture,
      name: req.body.name,
      city: req.body.city,
      experienceYears: req.body.experienceYears,
      propertyType: req.body.propertyType,
      propertyFor: req.body.propertyFor,
      agency: req.body.agency,
      user: savedUser._id,
    });

    const [savedStaff, staffErr] = await common.p2r(staff.save());

    if (staffErr) {
      res.status(500).send({
        message: 'An error occurred while signing up staff',
        error: staffErr,
      });
      return;
    }

    if (!savedStaff) {
      res.status(500).send({
        message: 'Staff not signed up',
      });
      return;
    }

    userType = 'Staff';
  } else if (type.toLowerCase() === 'builder') {
    const builder = new Builder({
      builderName: req.body.builderName,
      builderLogo: req.body.builderLogo,
      builderCoverPicture: req.body.builderCoverPicture,
      aboutUs: req.body.aboutUs,
      ntn: req.body.ntn,
      experienceYears: req.body.experienceYears,
      operatingCities: req.body.operatingCities,

      additionalMobileNumber: req.body.additionalMobileNumber,
      landline: req.body.landline,
      whatsappNumber: req.body.whatsappNumber,

      name: req.body.name,
      owners: req.body.owners,
      cnic: req.body.cnic,
      partners: req.body.partners,

      city: req.body.city,
      address: req.body.address,
      additionalEmail: req.body.additionalEmail,

      user: savedUser._id,
    });

    const [savedBuilder, builderErr] = await common.p2r(builder.save());

    if (builderErr) {
      res.status(500).send({
        message: 'An error occurred while signing up builder',
        error: builderErr,
      });
      return;
    }

    if (!savedBuilder) {
      res.status(500).send({
        message: 'Builder not signed up',
      });
      return;
    }

    userType = 'Builder';
  } else {
    userType = 'User';
  }

  const [sentEmail, sendEmailErr] = await common.p2r(
    // sendEmail.sendConfirmationEmail(req.body.name, email, '', 123);
    sendEmail.sendSignUpEmail({name: req.body.username, email: email, link: confirmationCode })
  );

  if (sendEmailErr) {
    res.status(500).send({
      message:
        'User signed up successfully but an error occurred while sending confirmation email',
      error: sendEmailErr,
    });
    return;
  }

  // if (!sentEmail) {
  //   res.status(500).send({
  //     message: 'Confirmation email not sent',
  //   });
  //   return;
  // }

  res.status(200).send({
    message: `${userType} signed up successfully and confirmation email has been sent`,
  });
  return;
};

/* ==================================================== SIGN IN BY USERNAME ==================================================== */
exports.signInByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.query.username });

    if (!user) {
      return res
        .status(404)
        .send({ message: 'User does not exist with this username' });
    }
    
    if (user.status != 'Active') {
      return res.status(401).send({
        message: 'Pending account. Please verify your email!',
      });
    }

    var passwordIsValid = bcrypt.compareSync(req.query.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: 'Incorrect password',
      });
    }

    var token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400, // 24 hours
    });

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      type: user.type,
      accessToken: token
    });
    return;
  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
};

/* ==================================================== SIGN IN BY EMAIL ==================================================== */
exports.signInByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.query.email });

    if (!user) {
      return res
        .status(404)
        .send({ message: 'User does not exist with this email' });
    }

    if (user.status != 'Active') {
      return res.status(401).send({
        message: 'Pending account. Please verify your email!',
      });
    }

    var passwordIsValid = bcrypt.compareSync(req.query.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: 'Incorrect password',
      });
    }

    var token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400, // 24 hours
    });

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      type: user.type,
      accessToken: token,
    });
    return;
  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
};
