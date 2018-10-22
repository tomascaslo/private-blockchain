'use strict';

const NotaryDB = require('./db/notary');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message'); 

const VALIDATION_WINDOW = 300; // seconds

class StarRegistry {

  constructor() {
    this.notary = new NotaryDB();
  }

  async getAddressData(address) {
    return await this.getOrCreateDataForAddress(address);
  }

  async getOrCreateDataForAddress(address) {
    let data = await this.notary.getData(address);
    if (data && this.isWithinValidationWindow(data)) {
      data = await this.updateTimestamp(data);
      return data;
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
    const data = await this.notary.getData(address);
    if (!this.isWithinValidationWindow(data)) {
      throw Error('Invalid or expired request');
    }
    const message = data.message;
    const updatedData = await this.updateTimestamp(data);
    const registration = {
      'status': updatedData
    };

    if (bitcoinMessage.verify(message, address, signature)) {
      registration.registerStar = true;
      registration.status.messageSignature = 'valid';
    } else {
      registration.registerStar = false;
      registration.status.messageSignature = 'invalid';
    }

    return registration;
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

  async updateTimestamp(data) {
    data = Object.assign({}, data, { validationWindow: this.getNewValidationWindow(data) });

    return await this.notary.saveData(data);
  }

  getNewValidationWindow(data) {
    const now = new Date().getTime() / 1000; // UTC ms
    const newValidationWindow = VALIDATION_WINDOW - (now - (data.timestamp / 1000));

    return Math.floor(newValidationWindow);
  }

}

module.exports = StarRegistry;
