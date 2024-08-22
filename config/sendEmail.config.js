const Brevo = require("@getbrevo/brevo");
const authConfig = require("./auth.config");
const defaultClient = Brevo.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = "";

module.exports.sendSignUpEmail = async (data) => {
  const apiInstance = new Brevo.TransactionalEmailsApi();

  let sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.templateId = 1; // 6 is google , 5 is early access
  sendSmtpEmail.sender = { name: "4Devari", email: "devarisocials@gmail.com" };
  sendSmtpEmail.to = [{ email: data?.email }];
  sendSmtpEmail.params = {
    name: data?.name,
    link: `${authConfig.FRONT_BASE_URL}/login?confirmationCode=${data?.link}`,
  };

  return apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log("API called successfully.", data);
    },
    function (error) {
      console.error("Email Error", error);
    }
  );
};

module.exports.sendForgotPasswordEmail = async (data) => {
  const apiInstance = new Brevo.TransactionalEmailsApi();

  let sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.templateId = 4;
  sendSmtpEmail.sender = { name: "4Devari", email: "devarisocials@gmail.com" };
  sendSmtpEmail.to = [{ email: data?.email }];
  sendSmtpEmail.params = { name: data?.name, link: data?.link };

  return apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log("API called successfully.", data);
    },
    function (error) {
      console.error("Email Error", error);
    }
  );
};

module.exports.sendSubscriptionEmail = async (data) => {
  const apiInstance = new Brevo.TransactionalEmailsApi();

  let sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.templateId = 5;
  sendSmtpEmail.sender = { name: "4Devari", email: "devarisocials@gmail.com" };
  sendSmtpEmail.to = [{ email: data?.email }];
  //  sendSmtpEmail.params = { name: data?.name, link: data?.link};

  return apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log("API called successfully.", data);
    },
    function (error) {
      console.error("Email Error", error);
    }
  );
};

module.exports.sendContactEmail = async (data) => {
  const apiInstance = new Brevo.TransactionalEmailsApi();

  let sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.templateId = 6;
  sendSmtpEmail.sender = { name: "4Devari", email: "devarisocials@gmail.com" };
  sendSmtpEmail.to = [{ email: data?.email }];
  sendSmtpEmail.params = { ...data };

  return apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log("API called successfully.", data);
    },
    function (error) {
      console.error("Email Error", error);
    }
  );
};

// const config = require('./auth.config');
// // const s3Config = require('./s3.config');

// const user = config.user;

// let aws = require('aws-sdk');

// const SES_CONFIG = {
//   accessKeyId: 'AKIAWTX656AQTKS475PJ',
//   secretAccessKey: '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',
//   region: 'ap-southeast-1',
// };
// // const SES_CONFIG = {
// //   accessKeyId: s3Config.id,
// //   secretAccessKey: s3Config.secretAccessKey,
// //   region: 'ap-southeast-1',
// // };

// module.exports.sendConfirmationEmail = async (
//   name,
//   email,
//   userType,
//   confirmationCode
// ) => {
//   let htmlBody = ``;
//   htmlBody = `
//       <h2>Hello ${name}!</h2>
//       <p>Welcome to Zilaay!</p>
//       <a href=https://www.zilaay.com/confirmUser?code=${confirmationCode}> Activate your Zilaay account</a>
//       </div>
//       `;

//   var ses = new aws.SES(SES_CONFIG);
//   // var ses = new aws.SES({ region: 'ap-southeast-1' });

//   try {
//     var params = {
//       Destination: {
//         ToAddresses: [email],
//       },
//       Message: {
//         Body: {
//           Html: { Data: htmlBody },
//         },

//         Subject: { Data: 'Welcome to Zilaay! Please verify your account' },
//       },
//       Source: user,
//     };

//     const response = await ses.sendEmail(params).promise();
//     console.log(response)
//     return response;
//   } catch (err) {
//     console.log('SES send confirmation email error ', err);
//     throw err;
//   }
// };

// module.exports.sendForgotPasswordEmail = async (
//   name,
//   email,
//   resetPasswordCode
// ) => {
//   let htmlBody = ``;
//   htmlBody = `
//       <h2>Hello ${name}!</h2>
//       <p>Please click the link below to reset your password.</p>
//       <a href=https://www.auqta.com/forgotPassword?code=${resetPasswordCode}>Reset my password</a>
//       </div>
//       `;

//   var ses = new aws.SES({ region: 'ap-southeast-1' });

//   try {
//     var params = {
//       Destination: {
//         ToAddresses: [email],
//       },
//       Message: {
//         Body: {
//           Html: { Data: htmlBody },
//         },

//         Subject: { Data: 'Reset Password of Zilaay Account' },
//       },
//       Source: user,
//     };

//     const response = await ses.sendEmail(params);
//     return response;
//   } catch (err) {
//     console.log('SES send forgot password email error ', err);
//     throw err;
//   }
// };

// module.exports.sendContactUsEmail = async (data) => {
//   const { name, email, phone, message } = data;
//   const date = new Date().toLocaleString().replace(',', '');

//   let htmlBody = ``;
//   htmlBody = `
//       <p><b>From: </b>${name}</p>
//       <p><b>Email: </b>${email}</p>
//       <p><b>Phone: </b>${phone}</p>
//       <p><b>Date: </b>${date}</p>
//       <p><b>Message: </b>${message}</p>
//       </div>
//       `;

//   var ses = new aws.SES({ region: 'ap-southeast-1' });

//   try {
//     var params = {
//       Destination: {
//         ToAddresses: ['info@auqta.com'],
//       },
//       Message: {
//         Body: {
//           Html: { Data: htmlBody },
//         },

//         Subject: { Data: 'You have a new inquiry!' },
//       },
//       Source: user,
//     };

//     const response = await ses.sendEmail(params);
//     return response;
//   } catch (err) {
//     console.log('SES send Contact Us email error ', err);
//     throw err;
//   }
// };

// module.exports.sendNewsletterEmail = async (email) => {
//   let htmlBody = ``;
//   htmlBody = `
//         <p>You have successfully subscribed to our newsletter!</p>
//         <a href=https://www.auqta.com/unsubscribeFromNewsletter?email=${email}>Unsubscribe from Newsletter</a>
//       `;

//   var ses = new aws.SES({ region: 'ap-southeast-1' });

//   try {
//     var params = {
//       Destination: {
//         ToAddresses: [email],
//       },
//       Message: {
//         Body: {
//           Html: { Data: htmlBody },
//         },

//         Subject: {
//           Data: 'Thank you for subscribing to the Zilaay Newsletter!',
//         },
//       },
//       Source: user,
//     };

//     const response = await ses.sendEmail(params);
//     return response;
//   } catch (err) {
//     console.log('SES send Newsletter email error ', err);
//     throw err;
//   }
// };
