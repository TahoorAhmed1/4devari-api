const db = require('../../models');
const { User, Agency, Staff, Builder } = db;

const common = require('../../config/common.config');

/* ==================================================== GET ALL USERS ==================================================== */
exports.getAllUsers = async (req, res) => {
  const [users, usersErr] = await common.p2r(
    User.find()
      .select('-password -confirmationCode')
      .skip(
        parseInt(req.query.pageNumber) > 0
          ? (parseInt(req.query.pageNumber) - 1) * parseInt(req.query.nPerPage)
          : 0
      )
      .limit(parseInt(req.query.nPerPage))
  );

  if (usersErr) {
    res.status(500).send({
      message: 'An error occurred while getting all users',
      error: usersErr,
    });
    return;
  }

  if (!users) {
    return res.status(404).send({ message: 'No users found' });
  }

  res.status(200).send(users);
  return;
};

/* ==================================================== MAKE USER TYPE ADMIN ==================================================== */
exports.makeUserTypeAdmin = async (req, res) => {
  const [user, userErr] = await common.p2r(
    User.findByIdAndUpdate(
      req.params.id,
      { type: 'admin' },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password -confirmationCode')
  );

  if (userErr) {
    res.status(500).send({
      message: 'An error occurred while finding user and updating user type',
      error: userErr,
    });
    return;
  }

  if (!user) {
    return res.status(404).send({ message: 'User not found or updated' });
  }

  res.status(200).send(user);
  return;
};

/* ==================================================== VERIFY USER WITHOUT CONFIRMATION CODE ==================================================== */
exports.verifyUserWithoutCode = async (req, res) => {
  const [user, userErr] = await common.p2r(
    User.findByIdAndUpdate(
      req.params.userId,
      {
        status: 'Active',
        confirmationCode: '',
      },
      {
        new: true,
        runValidators: true,
      }
    )
  );

  if (userErr) {
    res.status(500).send({
      message: 'An error occurred while updating user',
      error: userErr,
    });
    return;
  }

  if (!user) {
    return res
      .status(404)
      .send({ message: 'User account not found or updated' });
  }

  res.send({ message: `User account activated successfully` });
  return;
};
