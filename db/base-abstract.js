'use strict';
// Base level abstract class.

const level = require('level');
const debug = require('debug')('BaseDB');

class BaseDB {

  constructor(dbName) {
    this.fileName = dbName || this.getDefaultName();
    this.dbFile = `./${this.fileName}`;
  }

  getDefaultName() {
    throw new Error('getDefaultName() method not implemented.');
  }

  getActions() {
    throw new Error('getActions() method not implemented.');
  }

  run(action, ...args) {
    const levelDBActions = this.getActions();
    debug(`Running ${action} with ${args}`);
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
            db.close((err) => {
              debug(`Closing from run(${action}, ${args})`);
              debug(err);
              if (err) { return reject(err); }
              resolve(val);
            });
          })
          .catch((err) => {
            db.close((closeErr) => {
              debug(`Closing from run(${action}, ${args})`);
              debug(closeErr);
              if (closeErr) { return reject(closeErr); }
              reject(err);
            });
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
      throw err;
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
          debug('Closing from getAmountOfRecords()');
          rawDB.close((err) => {
            if (err) { return reject(err); }
            resolve(i);
          });
        });
    });
  }

}

module.exports = BaseDB;
