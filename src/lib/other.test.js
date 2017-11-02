const other = require('./other');

describe('foo', function() {
    test('should return 5', function() {
        expect(other.foo()).toEqual(5);
    });
});
