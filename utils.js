'use strict';

function validateProperty(obj, prop, required=false, default=null) {
  if (prop in obj) {
    const val = obj[prop];
    if (required && val == null) {
      propertyRequiredError(prop);
    } else {
      if (typeof val === 'undefined') {
        return default;
      } else {
        return val;
      }
    }
  } else {
    if (required) {
      propertyRequiredError(prop);
    } else {
      obj[prop] = default;
      return default;
    }
  }
}

function propertyRequiredError(prop) {
  throw new Error(`Property ${prop} is required.`);
}

module.exports = {
  validateProperty,
}
