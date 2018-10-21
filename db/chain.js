'use strict';
/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const debug = require('debug')('db:chain');
const BaseDB = require('./baseAbstract');

const npmEvent = process.env.npm_lifecycle_event;
const defaultDBName = npmEvent ? 'chaindata-' + npmEvent : 'chaindata';


// Supported levelDB actions for chainDB
// nargs - refers to the number of arguments for action
const chainDBActions = {
  'put': {'nargs': 2},
  'get': {'nargs': 1},
}

class ChainDB extends BaseDB {

  getDefaultName() {
    return defaultDBName;
  }

  getActions() {
    return chainDBActions;
  }

  // Get blockchain length
  async getChainLength() {
    return this.getAmountOfRecords();
  }

  // Add data to levelDB with value
  addDataValue(value) {
    const rawDB = this.getDB();
    let i = 0;
    return new Promise((resolve, reject) => {
      rawDB.createReadStream()
        .on('data', (data) => {
          i++;
        })
        .on('error',(err) => {
          debug('Unable to read data stream!', err);
          rawDB.close(() => {
            reject(err);
          });
        })
        .on('close', () => {
          debug('Block #' + i);
          debug('Closing from addDataValue()')
          rawDB.close((err) => {
            if (err) { return reject(err); }
            return this.run('put', i, value)
              .then(() => { resolve(); });
          });
        });
    });
  }

  // Get last of records
  getLastRecord() {
    const rawDB = this.getDB();
    let i = 0;
    return new Promise((resolve, reject) => {
      rawDB.createValueStream()
      .on('data', () => {
        i++;
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('close', () => {
        debug('Closing from getLastRecord()')
        return rawDB.get(i-1)
          .then((val) => {
            rawDB.close((err) => {
              if (err) { return reject(err); }
              resolve(val);
            });
          });
      });
    });
  }

}

module.exports = ChainDB;
