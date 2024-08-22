const controller = require('../../middlewares/s3Operations');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post('/api/s3/getUrlForImage', controller.getSignedUrlForImage);

  app.post('/api/s3/getUrlWithKey', controller.getSignedUrlWithKey);
};
