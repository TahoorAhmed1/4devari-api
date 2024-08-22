// exports.paginateArray = (array, page_number, page_size) => {
//   if (page_number !== undefined && page_size !== undefined) {
//     page_number = parseInt(page_number);
//     page_size = parseInt(page_size);
//     // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
//     const skipVal = (page_number - 1) * page_size;
//     return array.slice(page_number > 0 ? skipVal : 0, page_number * page_size);
//   } else {
//     return array;
//   }
// };

exports.paginateArray = (array, page_number, page_size) => {
  let pageNumber = page_number || 1;
  let pageSize = page_size || 10;

    pageNumber = parseInt(pageNumber);
    pageSize = parseInt(pageSize);
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    const skipVal = (pageNumber - 1) * pageSize;

    const paginatedArray = array.slice(pageNumber > 0 ? skipVal : 0, pageNumber * pageSize);

    return {
      data: paginatedArray,
      meta: {
        totalItems: array.length,
        totalPages: Math.ceil(array.length / pageSize),
        currentPage: pageNumber,
        pageSize: pageSize,
      },
    };
};

exports.sortByDateArray = (array) => {
  // sorts in descending order
  array.sort(function (a, b) {
    var c = new Date(a.propertyListing?.dateAdded);
    var d = new Date(b.propertyListing?.dateAdded);
    return d - c;
  });
  return array;
};

exports.sortByDateAndPaginateArray = (array, page_number, page_size) => {
  array = exports.sortByDateArray(array);
  array = exports.paginateArray(array, page_number, page_size);
  return array;
};

exports.appendDateToImage = (image) => {
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

  var fileNameSplit = image.split('.');
  var finalFileName = '';
  if (Array.isArray(fileNameSplit)) {
    finalFileName = fileNameSplit[0] + '-' + date + '.' + fileNameSplit[1];
  } else {
    finalFileName = image;
  }
  return finalFileName;
};

exports.getActivePropertyListings = (proplist) => {
  if (proplist.propertyListing !== null) {
    if (
      proplist.propertyListing['isActive'] === undefined ||
      proplist.propertyListing.isActive === true
    )
      return proplist;
  }
};

exports.getNonDraftPropertyListings = (proplist) => {
  if (proplist.propertyListing !== null) {
    if (
      proplist.propertyListing['isDraft'] === undefined ||
      proplist.propertyListing.isDraft === false
    )
      return proplist;
  }
};

exports.getActiveAndNonDraftPropertyListings = (proplist) => {
  if (proplist.propertyListing !== null) {
    if (
      (proplist.propertyListing['isActive'] === undefined ||
        proplist.propertyListing.isActive === true) &&
      (proplist.propertyListing['isDraft'] === undefined ||
        proplist.propertyListing.isDraft === false) &&
      (proplist.propertyListing['onPause'] === undefined ||
        proplist.propertyListing.onPause === false)
    )
      return proplist;
  }
};

exports.getActiveUsers = (user) => {
  if (user.user !== null) {
    if (user.user['status'] === 'Active') {
      return user;
    }
  }
};

exports.p2r = async (promise) => {
  try {
    return [await promise, null];
  } catch (e) {
    return [null, e];
  }
};
