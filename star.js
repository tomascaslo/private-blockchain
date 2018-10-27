'use strict';

const { validateProperty } = require('./utils');

class Star {
  constructor(body) {
    let { address, star = {} } = body;
    let { dec, ra, story, mag, con } = star;
    this.address = address;
    this.star = star;
    this.star.dec = validateProperty(star, 'dec', true);
    this.star.ra = validateProperty(star, 'ra', true);
    this.star.story = validateProperty(star, 'story', true);
    this.star.mag = validateProperty(star, 'mag');
    this.star.con = validateProperty(star, 'con');
  }
}

module.exports = Star;
