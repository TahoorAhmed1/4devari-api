require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const session = require("express-session");
const config = require("./config/db.config");
// const serverless = require('serverless-http');
const passport = require("passport");
const schedule = require("node-schedule");
const propertyController = require("./controllers/property-controllers/property.controller");
// const passportConfig =
//   require('./controllers/user-controllers/passport.controller')(passport);

var corsOptions = {
  origin: "http://localhost:8081",
};
// app.use(cors(corsOptions));
app.use(cors());

app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
console.log(process.env.MONDO_URI_PROD);

const db = require("./models");
db.mongoose.set("strictQuery", false);
db.mongoose
  .connect(
    "mongodb+srv://developers:OFp1ps78oLztRuWe@cluster0.t54clke.mongodb.net/devari?retryWrites=true",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // tlsCAFile: `global-bundle.pem`,
      // sslValidate: false,
      // sslCA: `global-bundle.pem`,
    }
  )
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("CONNECTION ERROR:", err);
    process.exit();
  });

const job = schedule.scheduleJob("0 0 * * *", () => {
  propertyController.archiveExpiredProperties();
});

app.use(
  session({
    secret: "some secret",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.json({ message: "Hello world!" });
});

require("./routes/user-routes/auth.routes")(app);
require("./routes/user-routes/user.routes")(app);
require("./routes/property-routes/property.routes")(app);
require("./routes/project-routes/project.routes")(app);
require("./routes/misc-routes/s3upload.routes")(app);
require("./routes/admin-routes/user.admin.routes")(app);
require("./routes/inbox-routes/inbox.routes")(app);
require("./routes/analytic-routes/event.routes")(app);
require("./routes/subscription-routes/subscription.routes")(app);
require("./routes/payment-routes/subscription.routes")(app);

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, x-access-token"
  );
  res.header("Access-Control-Allow-Methods", "GET", "POST", "PUT");
  next();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
