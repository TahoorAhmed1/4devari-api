const { default: axios } = require("axios");
const db = require("../../models");

exports.paypro = async (req, res) => {
  try {
    const body = req.body;

    const response = await axios.post(
      `https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken`,
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.status(200).json(response.data.ACCESS_TOKEN);
  } catch (error) {
    console.error("Error processing PayFast payment:", error.message);
    res
      .status(500)
      .json({ error: "Payment processing failed", details: error.message });
  }
};

exports.payproTransection = async (req, res) => {
  try {
    const body = req.body;

    const response = await axios.post(
      `https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction`,
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error processing PayFast payment:", error.message);
    res
      .status(500)
      .json({ error: "Payment processing failed", details: error.message });
  }
};
