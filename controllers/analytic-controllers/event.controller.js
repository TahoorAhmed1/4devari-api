const db = require("../../models");
const { Event } = db;

const common = require("../../config/common.config");

/* ==================================================== GET Events count ==================================================== */
// exports.getEventCountOfUser = async (req, res) => {
//   let counts = {};
//   let category = ['click', 'view'];

//   if(req.query.category)[
//     category = category
//   ]

//   let body = {
//     user: req.params.userId,
//   };
  
//   if (req.query?.propertyId) {
//     body.property = req.query.propertyId;
//   } else if (req.query?.projectId) {
//     body.project = req.query.projectId;
//   }
//   if (req.query?.startDate || req.query?.endDate) {
//     body.createdAt = {
//       $gte: req.query?.startDate || 0,
//       $lte: req.query?.endDate || Infinity
//     };
//   }
//   if(category.includes('click')){
//     const [whatsappCount, whatsappCountErr] = await common.p2r(Event.find({...body, name: "whatsapp-click", category: "click"}).count());
//     const [chatsCount, chatsCountErr] = await common.p2r(Event.find({...body, name: 'chat-click', category: "click"}).count());
//     const [emailCount, emailCountErr] = await common.p2r(Event.find({...body, name: 'email-click', category: "click"}).count());

//     counts.whatsappCount = whatsappCount
//     counts.chatsCount = chatsCount
//     counts.emailCount = emailCount
//     counts.leadsCount = whatsappCount + chatsCount + emailCount
//   }

//   if(category.includes('view')){
//     const [profileViewCount, profileViewCountErr] = await common.p2r(Event.find({...body, name: 'profile-view', category: 'view'}).count());
//     const [propertyViewCount, propertyViewCountErr] = await common.p2r(Event.find({...body, name: 'property-view', category: 'view'}).count());
//     const [projectViewCount, projectViewCountErr] = await common.p2r(Event.find({...body, name: 'project-view', category: 'view'}).count());
    
//     counts.profileViewCount = profileViewCount
//     counts.propertyViewCount = propertyViewCount
//     counts.projectViewCount = projectViewCount
//   }

//   res.status(200).send(counts);
//   return;
// };

let Days = 7;

exports.getEventCountOfUser = async (req, res) => {
  try {
    let counts = {};
    let category = ['click', 'view'];
    let startDate = req.query?.startDate ? new Date(req.query?.startDate) : new Date().setDate(new Date().getDate() - 15);
    let endDate = req.query?.endDate ? new Date(req.query?.endDate) : new Date().setDate(new Date().getDate() + 15)

    if (req.query?.category) {
      category = req.query.category.split(','); // Assuming category is a comma-separated string
    }

    let body = {};

    if(req.params.userId){
     body.user = req.params.userId 
    }

    if(req.query.staffId){
      body.staff = req.query.staffId
      delete body.user
    }

    if (req.query?.propertyId) {
      body.property = req.query.propertyId;
    } else if (req.query?.projectId) {
      body.project = req.query.projectId;
    }

    if (startDate || endDate) {
      body.createdAt = {
        $gte: new Date(startDate).setHours(1, 0, 0, 0),
        $lte: new Date(endDate).setHours(23, 59, 59, 999),
      };
    }

    const clickQueries = category.includes('click')
      ? [
          Event.find({ ...body, name: 'whatsapp-click', category: 'click' }).count(),
          Event.find({ ...body, name: 'chat-click', category: 'click' }).count(),
          Event.find({ ...body, name: 'email-click', category: 'click' }).count(),
        ]
      : [];

    const viewQueries = category.includes('view')
      ? [
          Event.find({ ...body, name: 'profile-view', category: 'view' }).count(),
          Event.find({ ...body, name: 'property-view', category: 'view' }).count(),
          Event.find({ ...body, name: 'project-view', category: 'view' }).count(),
        ]
      : [];

    const [clickCounts, viewCounts] = await Promise.all([
      Promise.all(clickQueries),
      Promise.all(viewQueries),
    ]);

    if (category.includes('click')) {
      counts.whatsappCount = clickCounts[0];
      counts.chatsCount = clickCounts[1];
      counts.emailCount = clickCounts[2];
      counts.leadsCount = clickCounts.reduce((sum, count) => sum + count, 0);
    }

    if (category.includes('view')) {
      counts.profileViewCount = viewCounts[0];
      counts.propertyViewCount = viewCounts[1];
      counts.projectViewCount = viewCounts[2];
    }

    res.status(200).send(counts);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.getEventsOfUser = async (req, res) => {
  try {
    const currentDate = new Date();
    let category = ['click', 'view'];
    let startDate = req.query?.startDate ? new Date(req.query?.startDate) : new Date().setDate(new Date().getDate() - 15);
    let endDate = req.query?.endDate ? new Date(req.query?.endDate) : new Date().setDate(new Date().getDate() + 15)


    let body = {};

    if(req.params.userId){
     body.user = req.params.userId 
    }

    if(req.query.staffId){
      body.staff = req.query.staffId
      delete body.user
    }

    if (req.query.category) {
      body.category = { $in: req.query.category.split(',') }; // Assuming category is a comma-separated string
    }

    if (req.query?.name) {
      body.name = { $in: req.query.name.split(',') };
    }

    if (req.query?.propertyId) {
      body.property = req.query.propertyId;
    } else if (req.query?.projectId) {
      body.project = req.query.projectId;
    }

    if (startDate && endDate) {
      body.createdAt = {
        $gte: new Date(startDate).setHours(1, 0, 0, 0),
        $lte: new Date(endDate).setHours(23, 59, 59, 999),
      };
    }

    const [events, eventsErr] = await common.p2r(
      Event.find({ ...body }).select('category name createdAt')
    );
  
    if (eventsErr) {
      res.status(500).send({
        message: 'An error occurred while getting all events',
        error: eventsErr,
      });
      return;
    }
  
    if (!events) {
      return res.status(404).send({ message: 'No events found' });
    }
  
    res.status(200).send(events);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.getEventsByPerDay = async (req, res) => {
  try {
    let startDate = req.query?.startDate && new Date(req.query?.startDate)
    let endDate = req.query?.endDate && new Date(req.query?.endDate)
    const pageSize = parseInt(req.query.nPerPage) || 10;
    const page = parseInt(req.query.pageNumber) || 1;
    const skip = (page - 1) * pageSize;

    let body = {};

    if(req.params.userId){
     body.user = req.params.userId 
    }

    if(req.query.staffId){
      body.staff = req.query.staffId
      delete body.user
    }

    if (startDate && endDate) {
      body.createdAt = {
        $gte: new Date(startDate).setHours(1, 0, 0, 0),
        $lte: new Date(endDate).setHours(23, 59, 59, 999),
      };
    }

    // new Date(endDate).setDate(new Date(endDate).getDate() + 1)

    const [events, eventsErr] = await common.p2r(
      Event.find({ ...body })
        .select('category name createdAt').sort({ createdAt: -1 })
    );

    if (eventsErr) {
      res.status(500).send({
        message: 'An error occurred while getting events by per day',
        error: eventsErr,
      });
      return;
    }

    if (!events || events.length === 0) {
      return res.status(404).send({ message: 'No events found for the given criteria' });
    }

    // Group events by per day
    const groupedEvents = events.reduce((result, event) => {
      const date = event.createdAt.toISOString().split('T')[0]; // Extracting date portion
      result[date] = result[date] || { perDayViewsCount: 0, perDayClicksCount: 0 };
      // result[date].items.push({ category: event.category, name: event.name });
      if (event.category === 'view') {
        result[date].perDayViewsCount++;
      } else if (event.category === 'click') {
        result[date].perDayClicksCount++;
      }
      return result;
    }, {});

    // Paginated response
    const paginatedResponse = Object.entries(groupedEvents).slice(skip, skip + pageSize).map(([date, data]) => {
      return {
        date,
        perDayViewsCount: data.perDayViewsCount,
        perDayClicksCount: data.perDayClicksCount,
      };
    });

    // Calculate meta information
    const totalItems = Object.keys(groupedEvents).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Prepare the final response
    const responseObject = {
      data: paginatedResponse,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
      },
    };

    res.status(200).send(responseObject);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};



/* ==================================================== ADD Event ==================================================== */
exports.addEventOfUser = async (req, res) => {
  try {
    let eventBody = {
      user: req.params.userId,
      name: req.body.name,
      category: req.body.category,
    };

    if(req.body.staffId){
      eventBody.staff = req.body.staffId
    }

    if (req.body.propertyId) {
      eventBody.property = req.body.propertyId;
    } else if (req.body.projectId) {
      eventBody.project = req.body.projectId;
    }

    // Create a new event instance
    const newEvent = new Event(eventBody);

    // Save the new event to the database
    await newEvent.save();

    res.status(201).send({ message: "Event added successfully" });
  } catch (error) {
    res.status(500).send({
      message: "An error occurred while adding the event",
      error: error.message,
    });
  }
};
