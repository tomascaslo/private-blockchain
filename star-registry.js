'use strict';

const NotaryDB = require('./db/notary');

const VALIDATION_WINDOW = 300; // seconds

class StarRegistry {

  constructor() {
    this.notary = new NotaryDB();
  }

  // Overrides getData()
  async getData(key){
    try {
      let value = await this.run('get', key);
      debug('Value = ' + value);
      return value;
    } catch(err) {
      debug('Not found!', err);
      return null;
    }
  }

  async getAddressData(address) {
    return await this.getOrCreateDataForAddress(address);
  }

  async getOrCreateDataForAddress(address) {
    const data = await this.notary.getData(address);
    if (data) {
      return data;
    } else {
      return await createDataForAddress(address);
    }
  }

  async createDataForAddress(address) {
    const timestamp = new Date().getTime(); // UTC
    const message = `${address}:${timestamp}:starRegistry`;
    const addressData = {
      address,
      timestamp,
      message,
      validationWindow: VALIDATION_WINDOW,
    };

    return await saveData(addressData);
  }

}

module.exports = StarRegistry;
