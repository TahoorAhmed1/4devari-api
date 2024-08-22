const AWS = require('aws-sdk');
const s3bucketconfig = require('../config/s3.config');

exports.getSignedUrlForImage = (req, res) => {
  const s3 = new AWS.S3({
    accessKeyId: s3bucketconfig.id,
    secretAccessKey: s3bucketconfig.secretAccessKey,
  });

  const newDate = new Date();
  const month = parseInt(newDate.getMonth()) + 1;
  const date =
    month +
    '-' +
    newDate.getDate() +
    '-' +
    newDate.getFullYear() +
    '-' +
    newDate.getTime();

  var fileNameSplit = req.body.fileName.split('.');
  var finalFileName = '';
  if (Array.isArray(fileNameSplit)) {
    finalFileName = fileNameSplit[0] + '-' + date + '.' + fileNameSplit[1];
  } else {
    finalFileName = req.body.fileName;
  }

  const params = {
    Bucket: s3bucketconfig.name,
    Key: req.body.folderName + finalFileName,
    ContentType: 'image/*',
    Expires: 60 * 10,
  };

  try {
    const url = s3.getSignedUrl('putObject', params);

    res.status(200).send({
      headers: {
        'Content-Type': 'image/*',
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
        AllowedOrigins: '*',
      },
      body: {
        fileName: finalFileName,
        fileKey: req.body.folderName + finalFileName,
        presigned_url: url,
      },
    });
    return;
  } catch (err) {
    console.log('Error while getting signed URL ', err);
    return err;
  }
};

exports.getSignedUrlWithKey = (req, res) => {
  const s3 = new AWS.S3({
    accessKeyId: s3bucketconfig.id,
    secretAccessKey: s3bucketconfig.secretAccessKey,
  });

  let contentType = '';

  if (req.body.fileKey.includes('.')) {
    if (
      req.body.fileKey.split('.')[1].match('pdf') ||
      req.body.fileKey.split('.')[1].match('doc') ||
      req.body.fileKey.split('.')[1].match('docx')
    ) {
      contentType = 'application/*';
    } else if (
      req.body.fileKey.split('.')[1].toLowerCase().match('jpg') ||
      req.body.fileKey.split('.')[1].toLowerCase().match('jpeg') ||
      req.body.fileKey.split('.')[1].toLowerCase().match('png') ||
      req.body.fileKey.split('.')[1].toLowerCase().match('gif')
    ) {
      contentType = 'image/*';
    } else {
      res.status(500).send({
        message:
          'Invalid file type - must be image (jpg, jpeg, png, gif) or document (pdf, doc, docx)',
      });
      return;
    }
  } else {
    res.status(500).send({
      message: 'Invalid file',
    });
    return;
  }

  const params = {
    Bucket: s3bucketconfig.name,
    Key: req.body.fileKey,
    ContentType: contentType,
    Expires: 60 * 10,
  };

  try {
    const url = s3.getSignedUrl('putObject', params);

    res.status(200).send({
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
        AllowedOrigins: '*',
      },
      body: {
        fileKey: req.body.fileKey,
        presigned_url: url,
      },
    });
    return;
  } catch (err) {
    console.log('Error while getting signed URL ', err);
    return err;
  }
};
