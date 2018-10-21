'use strict';

const fs = require('fs');
const rimraf = require('rimraf');

const NotaryDB = require('./notary');

const dbName = 'notary-test';
let testDB = null;

describe('notary', function() {

  beforeAll(() => {
    testDB = new NotaryDB(dbName);
  });

  afterAll(() => {
    rimraf.sync(`./${dbname}`);
  });

  test('expect correct name to be set', () => {
    expect(testDB.fileName).toBe('notary-test');
  });

});


