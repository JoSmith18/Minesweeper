const index = require('./index');

describe('testing this setup', function() {
    test('2 + 2 should equal 4', function() {
        expect(index.add(2, 2)).toEqual(4);
    });
});
