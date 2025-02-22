const { body } = require('express-validator');


// use to make sure a json body only contains the expected fields
function validateNoExtraFields (allowedFields) {
   return body().custom((value, { req }) => {
      const receivedFields = Object.keys(req.body);    // Get the keys in the request body
      const unexpectedFields = receivedFields.filter(field => !allowedFields.includes(field));  // Find unexpected fields

      if (unexpectedFields.length > 0) {
          throw new Error(`Unexpected fields: ${unexpectedFields.join(", ")}`);  // Return an error for extra fields
      }

      return true;  // If no extra fields, return true to indicate validation passed
  });
}

module.exports.validateNoExtraFields = validateNoExtraFields;