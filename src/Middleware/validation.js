const mongoose = require("mongoose")

const isValidObjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
  };
  const validString = (String) => {
    if (/\d/.test(String)) {
      return true
    } else {
      return false;
    };
  };
  const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}
 const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

module.exports = {isValidRequestBody ,isValidObjectId,validString,isValid}