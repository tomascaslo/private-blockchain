'use strict';

const NotaryDB = require('./db/notary');

const VALIDATION_WINDOW = 300; // seconds

class StarRegistry {

  constructor() {
    this.notary = new NotaryDB();
  }

  async getAddressData(address) {
    return await this.getOrCreateDataForAddress(address);
  }

  async getOrCreateDataForAddress(address) {
    const data = await this.notary.getData(address);
    if (data && this.isWithinValidationWindow(data)) {
      return JSON.parse(data);
    } else {
      return await this.createDataForAddress(address);
    }
  }

  async createDataForAddress(address) {
    const timestamp = new Date().getTime(); // UTC ms
    const message = `${address}:${timestamp}:starRegistry`;
    const addressData = {
      address,
      timestamp,
      message,
      validationWindow: VALIDATION_WINDOW,
    };

    return await this.notary.saveData(addressData);
  }

  async validateRequestSignature(address, signature) {
    return await Promise.resolve({
        'registerStar': true,
        'status': {
          'address': '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ',
          'requestTimeStamp': '1532296090',
          'message': '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry',
          'validationWindow': 193,
          'messageSignature': 'valid'
        }
    });
  }

  isWithinValidationWindow(data) {
    if (!data) {
      return false;
    }
    if (typeof data === 'string' || data instanceof String) {
      data = JSON.parse(data);
    }
    const now = new Date().getTime() / 1000; // UTC sec

    return (now - (data.timestamp / 1000)) < data.validationWindow;
  }

}

module.exports = StarRegistry;
