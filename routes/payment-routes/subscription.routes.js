const controller = require("../../controllers/payment-controllers/payment.controller");

const subscriptionUrl = "/api";

module.exports = function (app) {
  app.post(`${subscriptionUrl}/payment`, controller.paypro);
  app.post(
    `${subscriptionUrl}/paymentTransection`,
    controller.payproTransection
  );
};
