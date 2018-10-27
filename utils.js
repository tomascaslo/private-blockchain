'use strict';

function validateProperty(obj, prop, required=false) {
  if (prop in obj) {
    const val = obj[prop];
    if (required && (val == null || (typeof val === 'string' && !val.trim()))) {
      propertyRequiredError(prop);
    } else {
      if (typeof val === 'undefined') {
        return null;
      } else {
        return val;
      }
    }
  } else {
    if (required) {
      propertyRequiredError(prop);
    }
  }
}

function propertyRequiredError(prop) {
  throw new Error(`Property ${prop} is required.`);
}

module.exports = {
  validateProperty,
}
