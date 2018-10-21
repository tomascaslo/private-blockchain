'use strict';

const StarRegistry = require('./star-registry');
const NotaryDB = require('./db/notary');

const dbName = 'notary-test';
let testDB = null;

describe('StarRegistry', () => {

  beforeAll(() => {
    testDB = new NotaryDB(dbName);
  });

  afterAll(() => {
    rimraf.sync(`./${dbName}`);
  });

  test('expect getOrCreateDataForAddress() to return current data in DB for address', async () => {
    const starRegistry = new StarRegistry();
    const address = 'address';
    const timestamp = new Date().getTime();
    const data = {
      address,
      timestamp,
      message: `${address}:${timestamp}:starRegistry`,
      validationWindow: 300
    };
    await testDB.saveData(data);
    starRegistry.isWithinValidationWindow = jest.fn().mockReturnValueOnce(true);
    starRegistry.updateTimestamp = jest.fn().mockResolvedValueOnce(data);
    const result = await starRegistry.getOrCreateDataForAddress(address);

    expect(result).toEqual(data);
  });

  test('expect getOrCreateDataForAddress() to return new data in DB for address', async () => {
    const starRegistry = new StarRegistry();
    const address = 'address';
    const timestamp = new Date().getTime();
    const data = 'new data';
    starRegistry.isWithinValidationWindow = jest.fn().mockReturnValueOnce(false);
    starRegistry.createDataForAddress = jest.fn().mockReturnValueOnce(data);
    const result = await starRegistry.getOrCreateDataForAddress(address);

    expect(starRegistry.createDataForAddress).toHaveBeenCalled();
    expect(starRegistry.createDataForAddress).toHaveReturnedWith(data);
  });

  test('expect createDataForAddress() to return value from saveData()', async () => {
    const starRegistry = new StarRegistry();
    const expectedValue = 'somevalue';
    const saveData = jest.fn().mockResolvedValueOnce(expectedValue);
    starRegistry.notary.saveData = saveData;
    const result = await starRegistry.createDataForAddress();

    expect(result).toBe(expectedValue);
  });

  test('expect isWithinValidationWindow() to return false on data = null', () => {
    const starRegistry = new StarRegistry();
    const data = null;

    expect(starRegistry.isWithinValidationWindow(data)).toBeFalsy();
  });

  test('expect isWithinValidationWindow() to return false on data.timestamp > now by more than 300', () => {
    const starRegistry = new StarRegistry();
    const data = {
      timestamp: new Date().getTime() - (400 * 1000),
      validationWindow: 300
    };

    expect(starRegistry.isWithinValidationWindow(data)).toBeFalsy();
  });

  test('expect isWithinValidationWindow() to return true on data.timestamp < now by less than 300', () => {
    const starRegistry = new StarRegistry();
    const data = {
      timestamp: new Date().getTime() - (150 * 1000),
      validationWindow: 300
    };

    expect(starRegistry.isWithinValidationWindow(data)).toBeTruthy();
  });

  test('expect updateTimestamp() to update validationWindow attr', async () => {
    const starRegistry = new StarRegistry();
    const address = 'someaddress';
    const timestamp = new Date().getTime() - (100 * 1000);
    const data = {
      address,
      timestamp,
      message: `${address}:${timestamp}:starRegistry`,
      validationWindow: 300
    };
    const result = await starRegistry.updateTimestamp(data);

    expect(result.validationWindow).not.toBe(data.validationWindow);
  });

});
