'use strict';

const level = require('level');
const debug = require('debug')('db:notary');
const BaseDB = require('./baseAbstract');

const npmEvent = process.env.npm_lifecycle_event;
const defaultDBName = npmEvent ? 'notary-' + npmEvent : 'notary';

// Supported levelDB actions for chainDB
// nargs - refers to the number of arguments for action
const chainDBActions = {
  'put': {'nargs': 2},
  'get': {'nargs': 1},
}

class NotaryDB extends BaseDB {

  getDefaultName() {
    return defaultDBName;
  }

  getActions() {
    return chainDBActions;
  }

}

module.exports = NotaryDB;
