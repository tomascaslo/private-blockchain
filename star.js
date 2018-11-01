'use strict';

const {
  validateProperty,
  validateStringMaxLength,
  validateIsASCII,
} = require('./utils');

const MAX_STORY_BYTES = 250; // ASCII chars

class Star {
  constructor(body) {
    let { address, star = {} } = body;
    let { dec, ra, story, mag, con } = star;
    this.address = address;
    this.star = star;
    this.star.dec = validateProperty(star, 'dec', true);
    this.star.ra = validateProperty(star, 'ra', true);
    this.star.story = validateStringMaxLength(
      validateIsASCII(validateProperty(star, 'story', true)),
      MAX_STORY_BYTES);
    this.star.mag = validateProperty(star, 'mag');
    this.star.con = validateProperty(star, 'con');
  }
}

module.exports = Star;
