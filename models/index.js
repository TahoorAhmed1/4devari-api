const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;

db.User = require('./User/user.model');
db.Agency = require('./User/agency.model');
db.Staff = require('./User/staff.model');
db.Builder = require('./User/builder.model');

db.Property = require('./Property/property.model');
db.ResProperty = require('./Property/resProperty.model');
db.CommProperty = require('./Property/commProperty.model');
db.PlotProperty = require('./Property/plotProperty.model');

db.ColivingSpace = require('./Property/colivingSpace.model');
db.CoworkingSpace = require('./Property/coworkingSpace.model');

db.PropertyFeatures = require('./Property/propertyFeatures.model');

db.Project = require('./Project/project.model');
db.ProjectFeatures = require('./Project/projectFeatures.model');

db.Chat = require('./Inbox/chat.model');
db.Inbox = require('./Inbox/inbox.model');

db.Event = require('./Analytics/event.model');
db.Subscription = require('./Subscribtion/subscription.model');

module.exports = db;
