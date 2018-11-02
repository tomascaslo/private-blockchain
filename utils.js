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
    return null;
  }
}

function validateStringMaxLength(str, maxLength) {
  if (str.length > maxLength) {
    stringMaxLengthExceededError(str, maxLength);
  }
  return str;
}

function validateIsASCII(str) {
  const isASCII = s => /^[\x00-\x7F]*$/.test(s);
  if (!isASCII(str)) {
    stringIsNotASCIIError(str);
  }
  return str;
}

function propertyRequiredError(prop) {
  throw new Error(`Property ${prop} is required.`);
}

function stringMaxLengthExceededError(str, maxLength) {
  throw new Error(`String maximun length exceeded for string "${str}" (${str.length} > ${maxLength}).`);
}

function stringIsNotASCIIError(str) {
  throw new Error(`String "${str}" should be ASCII.`);
}

function encodeString(from, to) {
  return str => Buffer.from(str, from).toString(to);
}

function asciiToHex(str) {
  return encodeString('ascii', 'hex')(str);
}

function hexToAscii(str) {
  return encodeString('hex', 'ascii')(str);
}


module.exports = {
  validateProperty,
  validateStringMaxLength,
  validateIsASCII,
  asciiToHex,
  hexToAscii,
};
