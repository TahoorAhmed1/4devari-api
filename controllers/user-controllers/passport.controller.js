const db = require('../../models');
const User = db.User;
const Inbox = db.Inbox;

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const auth = require('../../config/auth.config');

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use(
    new FacebookStrategy(
      {
        clientID: auth.facebook_app_id,
        clientSecret: auth.facebook_app_secret,
        callbackURL: auth.facebook_app_callback_url,
      },
      async function (accessToken, refreshToken, profile, done) {
        // const [user, status] = await User.findOrCreate({
        //   where: {
        //     social_user_id: profile.id,
        //     name: profile.displayName,
        //     registration_type: 'facebook',
        //   },
        // });
        // console.log(
        //   '============================================================================================='
        // );
        // console.log(req);
        // console.log(
        //   '============================================================================================='
        // );

        const newUser = new User({
          social_user_id: profile.id,
          name: profile.displayName,
          registration_type: 'facebook',
          status: 'Active',
          type: 'enduser',
          profileStatus: 'Pending',
          //userType: req.query.userType
        });

        try {
          let user = await User.findOne({ social_user_id: profile.id });

          if (user) {
            done(null, user);
          } else {
            user = await User.create(newUser);
            if(user?._id){
              const newInbox = new Inbox({
                user: user._id,
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
            }
            done(null, user);
          }
        } catch (err) {
          console.log('Facebook authentication error: ', err);
        }
        // user.save((err) => {
        //   if (err) {
        //     res.status(500).send({ message: err });
        //     return;
        //   }
        //   res.send({ message: `User signed in via Facebook successfully` });
        //   return;
        // });
        //cb(null, user);
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: auth.google_client_id,
        clientSecret: auth.google_client_secret,
        callbackURL: auth.google_app_callback_url,
      },
      async function (accessToken, refreshToken, profile, done) {
        // console.log(
        //   '============================================================================================='
        // );
        // console.log(req);
        // console.log(
        //   '============================================================================================='
        // );

        const newUser = new User({
          social_user_id: profile.id,
          name: profile.displayName,
          registration_type: 'google',
          status: 'Active',
          type: 'enduser',
          profileStatus: 'Pending',
        });

        try {
          let user = await User.findOne({ social_user_id: profile.id });

          if (user) {
            done(null, user);
          } else {
            user = await User.create(newUser);
            if(user?._id){
              const newInbox = new Inbox({
                user: user._id,
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
            }
            
            done(null, user);
          }
        } catch (err) {
          console.log('Google authentication error: ', err);
        }
      }
    )
  );

  // passport.use(
  //   new LocalStrategy(
  //     {
  //       usernameField: "email",
  //       passwordField: "password",
  //       session: true,
  //     },
  //     async function (username, password, done) {
  //       console.log(`trying to log in as ${username}`);
  //       const user = await User.findOne({ where: { email: username } });
  //       if (!user) {
  //         return done(null, false);
  //       }
  //       bcrypt.compare(password, user.password, function (err, res) {
  //         if (res) {
  //           console.log("successful login");
  //           return done(null, user);
  //         } else {
  //           return done(null, false);
  //         }
  //       });
  //     }
  //   )
  // );
};
