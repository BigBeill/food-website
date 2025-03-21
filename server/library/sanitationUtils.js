const { body, param, query } = require('express-validator');

// use to make sure express input only contains the expected fields
function validateNoExtraFields (allowedFields, location) {
   if (location == "body") {
      return body().custom((value, { req }) => {
         const receivedFields = Object.keys(req.body);    // Get the keys in the request body
         const unexpectedFields = receivedFields.filter(field => !allowedFields.includes(field));  // Find unexpected fields
   
         if (unexpectedFields.length > 0) {
            throw new Error(`Unexpected fields: ${unexpectedFields.join(", ")}`);  // Return an error for extra fields
         }
   
         return true;  // If no extra fields, return true to indicate validation passed
      });
   }
   else if (location == "params") {
      return param().custom((value, { req }) => {
         const receivedFields = Object.keys(req.params);    // Get the keys in the request body
         const unexpectedFields = receivedFields.filter(field => !allowedFields.includes(field));  // Find unexpected fields
   
         if (unexpectedFields.length > 0) {
            throw new Error(`Unexpected fields: ${unexpectedFields.join(", ")}`);  // Return an error for extra fields
         }
   
         return true;  // If no extra fields, return true to indicate validation passed
      });
   }
   else if (location == "query") {
      return query().custom((value, { req }) => {
         const receivedFields = Object.keys(req.query);    // Get the keys in the request body
         const unexpectedFields = receivedFields.filter(field => !allowedFields.includes(field));  // Find unexpected fields
   
         if (unexpectedFields.length > 0) {
            throw new Error(`Unexpected fields: ${unexpectedFields.join(", ")}`);  // Return an error for extra fields
         }
   
         return true;  // If no extra fields, return true to indicate validation passed
      });
   }
   else {
      throw new Error("Invalid location");
   }
}

module.exports.validateNoExtraFields = validateNoExtraFields;