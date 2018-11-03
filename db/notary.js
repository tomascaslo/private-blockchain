'use strict';

const level = require('level');
const debug = require('debug')('db:notary');
const BaseDB = require('./base-abstract');

const npmEvent = process.env.npm_lifecycle_event;
const defaultDBName = npmEvent ? 'notary-' + npmEvent : 'notary';

// Supported levelDB actions for chainDB
// nargs - refers to the number of arguments for action
const chainDBActions = {
  put: { nargs: 2 },
  get: { nargs: 1 },
  del: { nargs: 1 }
};

class NotaryDB extends BaseDB {
  getDefaultName() {
    return defaultDBName;
  }

  getActions() {
    return chainDBActions;
  }

  // Overrides getData()
  async getData(key) {
    try {
      let value = await this.run('get', key);
      debug('Value = ' + value);
      return JSON.parse(value);
    } catch (err) {
      debug('Not found!', err);
      return null;
    }
  }

  async saveData(data) {
    await this.run('put', data.address, JSON.stringify(data));
    return data;
  }

  async deleteDataForKey(key) {
    await this.run('del', key);
  }
}

module.exports = NotaryDB;
