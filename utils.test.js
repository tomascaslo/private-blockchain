'use strict';

const { validateProperty } = require('./utils');

describe('utils', () => {

  test('expect validateProperty() to return correct value if not required', () => {
    let obj = {key: 'test'};
    expect(validateProperty(obj, 'key')).toEqual(obj.key);

    obj = {key: ''};
    expect(validateProperty(obj, 'key')).toEqual(obj.key);

    obj = {key: 1};
    expect(validateProperty(obj, 'key')).toEqual(obj.key);

    obj = {key: null};
    expect(validateProperty(obj, 'key')).toEqual(obj.key);

    obj = {key: undefined};
    expect(validateProperty(obj, 'key')).toBeNull();
  });

  test('expect validateProperty() to return correct value if required', () => {
    let obj = {key: 'test'};
    expect(validateProperty(obj, 'key', true)).toEqual(obj.key);

    obj = {key: ''};
    expect(() => { validateProperty(obj, 'key', true) }).toThrow();

    obj = {key: '    '};
    expect(() => { validateProperty(obj, 'key', true) }).toThrow();

    obj = {key: 1};
    expect(validateProperty(obj, 'key', true)).toEqual(obj.key);

    obj = {key: null};
    expect(() => { validateProperty(obj, 'key', true) }).toThrow();

    obj = {key: undefined};
    expect(() => { validateProperty(obj, 'key', true) }).toThrow();
  });

});
