describe('Generic things to test', () => {
    test('Copy object', async () => {
        const firstObject = {
            description: 'this is first object'
        };
        let secondObject = Object.assign(Object.create(Object.getPrototypeOf(firstObject)), firstObject);
        expect(secondObject.description).toBe('this is first object');
        secondObject.description = 'this is second object';
        expect(firstObject.description).toBe('this is first object');
        expect(secondObject.description).toBe('this is second object');
    });
});