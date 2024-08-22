// Change Callback urls to same
module.exports = {
  secret: 'zilaay-secret-key',
  user: 'sarahejazca@gmail.com',

  facebook_app_id: '<YOUR_FACEBOOK_ID>',
  facebook_app_secret: '<YOUR_FACEBOOK_SECRET>',
  facebook_app_callback_url:
    process.env.NODE_ENV === 'dev'
      ? 'https://zilaay-backend.vercel.app/api/auth/facebook/callback'
      : 'https://zilaay-backend.vercel.app/api/auth/facebook/callback',
  
  google_client_id: '<YOUR_GOOGLE_CLIENT_ID>',
  google_client_secret: '<YOUR_GOOGLE_CLIENT_SCRET>',
  google_app_callback_url:
    process.env.NODE_ENV === 'dev'
      ? 'https://zilaay-backend.vercel.app/api/auth/google/callback'
      : 'https://zilaay-backend.vercel.app/api/auth/google/callback',
  FRONT_BASE_URL: 'https://zilaay-front.vercel.app'
};


