'use strict';
/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const debug = require('debug')('levelSandbox');

const npmEvent = process.env.npm_lifecycle_event;
const defaultDBName = npmEvent ? 'chaindata-' + npmEvent : 'chaindata';


// Supported levelDB actions
// nargs - refers to the number of arguments for action
const levelDBActions = {
  'put': {'nargs': 2},
  'get': {'nargs': 1},
}

class LevelDB {

  constructor(dbName) {
    this.fileName = dbName || defaultDBName;
    this.dbFile = `./${this.fileName}`;
  }

  run(action, ...args) {
    return new Promise((resolve, reject) => {
      if (!(action in levelDBActions)) {
        reject(new Error(`Unsupported action ${action}`));
      }
      if (levelDBActions[action]['nargs'] > args.length) {
        reject(new Error(`Incorrect number of arguments ${args.length} for action ${action}`));
      }
      const db = this.getDB((err, db) => {
        if (err) { return reject(err); }
        const result = db[action].apply(db, args)
          .then((val) => {
            db.close(() => {
              resolve(val);
            });
          })
          .catch((err) => {
            reject(err);
          });
        return result;
      });
    });
  }

  getDB(cb) {
    debug('Using db ' + this.fileName);
    const lvl = level.bind(null, this.fileName);
    return cb ? lvl(cb) : lvl();
  }

  // Add data to levelDB with key/value pair
  async addData(key, value) {
    try {
      await this.run('put', key, value);
    } catch(err) {
      debug('Block ' + key + ' submission failed', err);
    }
  }

  // Get data from levelDB with key
  async getData(key){
    try {
      let value = await this.run('get', key);
      debug('Value = ' + value);
      return value;
    } catch(err) {
      debug('Not found!', err);
      throw err;
    }
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
          reject(err);
        })
        .on('close', () => {
          debug('Block #' + i);
          rawDB.close(() => {
            return this.run('put', i, value)
              .then(() => { resolve(); });
          });
        });
    });
  }

  // Get amount of records
  getAmountOfRecords() {
    const rawDB = this.getDB();
    let i = 0;
    return new Promise((resolve, reject) => {
      rawDB.createReadStream()
      .on('data', (data) => {
        i++;
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('close', () => {
        rawDB.close(() => {
          resolve(i);
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
        return rawDB.get(i-1)
          .then((val) => {
            rawDB.close(() => {
              resolve(val);
            });
          });
      });
    });
  }
}

module.exports = LevelDB;
