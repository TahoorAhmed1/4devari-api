const db = require("../../models");
const { Subscription } = db;

const common = require("../../config/common.config");
const sendEmail = require('../../config/sendEmail.config');

/* ==================================================== CREATE Subscription ==================================================== */
exports.createSubscription = async (req, res) => {
  const [existingUser, existingUserErr] = await common.p2r(
    Subscription.findOne({ email: req.body.email })
  );

  if (existingUserErr) {
    res.status(500).send({
      message: 'An error occurred while checking if subscribtion exists',
      error: existingUserErr,
    });
    return;
  }

  if (existingUser) {
    res.status(500).send({
      message: 'Subscribtion already exists',
    });
    return;
  }

  const newUser = new Subscription({
    email: req.body.email,
  });

  const [saveUser, saveUserErr] = await common.p2r(newUser.save());

  if (saveUserErr) {
    res.status(500).send({
      message: 'An error occurred while creating subscribtion',
      error: saveUserErr,
    });
    return;
  }

  if (!saveUser) {
    res.status(500).send({
      message: 'Subscribtion not created',
    });
    return;
  }

  const [sentEmail, sendEmailErr] = await common.p2r(
    sendEmail.sendSubscriptionEmail({ email: newUser.email })
  );

  if (sendEmailErr) {
    res.status(500).send({
      message:
        'Subscribed successfully but an error occurred while sending email',
      error: sendEmailErr,
    });
    return;
  }

  res.status(200).send({ message: 'Subscribed successfully' });
  return;
};

/* ==================================================== DELETE Subscription ==================================================== */
exports.deleteSubscription = async (req, res) => {
  const [existingUser, existingUserErr] = await common.p2r(
    Subscription.findOneAndDelete({ email: req.body.email })
  );

  if (existingUserErr) {
    res.status(500).send({
      message: 'An error occurred while deleting the subscription',
      error: existingUserErr,
    });
    return;
  }

  if (!existingUser) {
    res.status(500).send({
      message: 'Subscription does not exist',
    });
    return;
  }

  res.status(200).send({ message: 'Subscription deleted successfully' });
  return;
};

/* ==================================================== GET All Subscriptions ==================================================== */
exports.getAllSubscriptions = async (req, res) => {
  const [subscriptions, subscriptionsErr] = await common.p2r(
    Subscription.find({})
  );

  if (subscriptionsErr) {
    res.status(500).send({
      message: 'An error occurred while fetching subscriptions',
      error: subscriptionsErr,
    });
    return;
  }

  res.status(200).send({ subscriptions });
  return;
};
